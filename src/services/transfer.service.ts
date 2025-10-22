import httpStatus from "http-status";
import mongoose, { FilterQuery } from "mongoose";
import { TransferListingModel, TransferListingDocument } from "../models/transfer.model";
import { TeamModel, PlayerSubDoc } from "../models/team.model";
import { HttpError } from "../middlewares/error";
import { TEAM_MAX_PLAYERS, TEAM_MIN_PLAYERS, TRANSFER_BUY_DISCOUNT } from "../config/constants.js";
import { PlayerModel } from "../models/player.model";

export interface TransferFilters {
  playerName?: string;
  minPrice?: number;
  maxPrice?: number;
  teamName?: string;
}

export const transferService = {
  async list(filters: TransferFilters = {}): Promise<TransferListingDocument[]> {
    const query: FilterQuery<TransferListingDocument> = { ...filters };
    if (filters.playerName) {
      query.playerName = { $regex: filters.playerName, $options: "i" };
    }
    if (filters.minPrice) {
      query.askingPrice = { $gte: filters.minPrice };
    }
    if (filters.maxPrice) {
      query.askingPrice = { $lte: filters.maxPrice };
    }
    if (filters.teamName) {
      query.sellerTeamName = { $regex: filters.teamName, $options: "i" };
    }

    let listings: TransferListingDocument[] = await TransferListingModel.find(query)
      .lean()
      .exec();
    return listings;
  },

  async addToMarket(userId: string, playerId: string, askingPrice: number): Promise<void> {
    const team = await TeamModel.findOne({ userId }).exec();
    if (!team) {
      throw new HttpError(httpStatus.NOT_FOUND, "Team not found");
    }
    const player: PlayerSubDoc | null = await PlayerModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(playerId),
      { onTransferList: true },
      { new: true },
    );
    if (!player) {
      throw new HttpError(httpStatus.NOT_FOUND, "Player not found in your team");
    }
    await TransferListingModel.updateOne(
      { playerId: player._id },
      {
        $set: {
          playerId: player._id,
          playerName: player.name,
          position: player.position,
          askingPrice,
          sellerTeamId: team._id,
          sellerTeamName: team.name,
        },
      },
      { upsert: true },
    ).exec();
  },

  async removeFromMarket(playerId: string): Promise<void> {
    const player: PlayerSubDoc | null = await PlayerModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(playerId),
      { onTransferList: false },
      { new: true },
    );
    if (!player) {
      throw new HttpError(httpStatus.NOT_FOUND, "Player not found in your team");
    }
    await TransferListingModel.deleteOne({ playerId: player._id }).exec();
  },

  async buy(userId: string, listingId: string): Promise<void> {
    const listing = await TransferListingModel.findById(listingId).exec();
    if (!listing) {
      throw new HttpError(httpStatus.NOT_FOUND, "Listing not found");
    }

    const buyerTeam = await TeamModel.findOne({ userId }).exec();
    if (!buyerTeam) {
      throw new HttpError(httpStatus.NOT_FOUND, "Buyer team not found");
    }

    const sellerTeam = await TeamModel.findById(listing.sellerTeamId).exec();
    if (!sellerTeam) {
      throw new HttpError(httpStatus.NOT_FOUND, "Seller team not found");
    }

    if (String(buyerTeam._id) === String(listing.sellerTeamId)) {
      throw new HttpError(httpStatus.BAD_REQUEST, "Cannot buy your own player");
    }

    const player: PlayerSubDoc | null = await PlayerModel.findById(listing.playerId).lean().exec();
    if (!player) {
      throw new HttpError(httpStatus.NOT_FOUND, "Player not found on seller team");
    }

    const buyerPlayersCount: number = await PlayerModel.countDocuments({
      teamId: buyerTeam._id,
    });
    const sellerPlayerCount: number = await PlayerModel.countDocuments({
      teamId: sellerTeam._id,
    });

    const price = Math.floor(listing.askingPrice * TRANSFER_BUY_DISCOUNT);
    if (buyerTeam.budget < price) {
      throw new HttpError(httpStatus.BAD_REQUEST, "Insufficient budget");
    }

    if (buyerPlayersCount + 1 > TEAM_MAX_PLAYERS) {
      throw new HttpError(httpStatus.BAD_REQUEST, "Buyer will have more than 25 players");
    }
    if (sellerPlayerCount - 1 < TEAM_MIN_PLAYERS) {
      throw new HttpError(httpStatus.BAD_REQUEST, "Seller will have less than 15 players");
    }

    await Promise.all([
      PlayerModel.updateOne(
        { _id: listing.playerId },
        { teamId: buyerTeam._id, onTransferList: false, price: price },
      ).exec(),
      TeamModel.updateOne({ _id: sellerTeam._id }, { budget: sellerTeam.budget + price }).exec(),
      TeamModel.updateOne({ _id: buyerTeam._id }, { budget: buyerTeam.budget - price }).exec(),
      TransferListingModel.deleteOne({ _id: listing._id }).exec(),
    ]);
  },
};
