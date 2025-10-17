import httpStatus from "http-status";
import mongoose from "mongoose";
import { TransferListingModel, TransferListingDocument } from "../models/transfer.model";
import { TeamModel, TeamDocument, PlayerSubdoc } from "../models/team.model";
import { HttpError } from "../middlewares/error";
import { TEAM_MAX_PLAYERS, TEAM_MIN_PLAYERS, TRANSFER_BUY_DISCOUNT } from "../config/constants.js";

export interface TransferFilters {
  playerName?: string;
  minPrice?: number;
  maxPrice?: number;
  teamName?: string; // optional, requires lookup
}

export const transferService = {
  async list(filters: TransferFilters = {}): Promise<TransferListingDocument[]> {
    const query: Record<string, unknown> = {};
    if (typeof filters.playerName === "string" && filters.playerName.length > 0) {
      query.$text = { $search: filters.playerName };
    }
    if (typeof filters.minPrice === "number") {
      query.askingPrice = { ...(query.askingPrice as object), $gte: filters.minPrice };
    }
    if (typeof filters.maxPrice === "number") {
      query.askingPrice = { ...(query.askingPrice as object), $lte: filters.maxPrice };
    }

    let listings = await TransferListingModel.find(query).exec();

    if (typeof filters.teamName === "string" && filters.teamName.length > 0) {
      const teams = await TeamModel.find({ name: new RegExp(filters.teamName, "i") })
        .select({ _id: 1 })
        .exec();
      const teamIds = teams.map((t) => t._id);
      listings = listings.filter((l) => teamIds.some((id) => String(id) === String(l.sellerTeamId)));
    }
    return listings;
  },

  async addToMarket(userId: string, playerId: string, askingPrice: number): Promise<void> {
    const team = await TeamModel.findOne({ userId }).exec();
    if (!team) {
      throw new HttpError(httpStatus.NOT_FOUND, "Team not found");
    }
    const player = team.players.id(new mongoose.Types.ObjectId(playerId)) as PlayerSubdoc | null;
    if (!player) {
      throw new HttpError(httpStatus.NOT_FOUND, "Player not found in your team");
    }
    player.onTransferList = true;
    await team.save();

    await TransferListingModel.updateOne(
      { playerId: player._id },
      {
        $set: {
          playerId: player._id,
          playerName: player.name,
          position: player.position,
          askingPrice,
          sellerTeamId: team._id,
        },
      },
      { upsert: true },
    ).exec();
  },

  async removeFromMarket(userId: string, playerId: string): Promise<void> {
    const team = await TeamModel.findOne({ userId }).exec();
    if (!team) {
      throw new HttpError(httpStatus.NOT_FOUND, "Team not found");
    }
    const player = team.players.id(new mongoose.Types.ObjectId(playerId)) as PlayerSubdoc | null;
    if (!player) {
      throw new HttpError(httpStatus.NOT_FOUND, "Player not found in your team");
    }
    player.onTransferList = false;
    await team.save();
    await TransferListingModel.deleteOne({ playerId: player._id }).exec();
  },

  async buy(userId: string, listingId: string): Promise<void> {
    const session = await TeamModel.db.startSession();
    await session.withTransaction(async () => {
      const listing = await TransferListingModel.findById(listingId).session(session).exec();
      if (!listing) {
        throw new HttpError(httpStatus.NOT_FOUND, "Listing not found");
      }
      const buyerTeam = await TeamModel.findOne({ userId }).session(session).exec();
      if (!buyerTeam) {
        throw new HttpError(httpStatus.NOT_FOUND, "Buyer team not found");
      }
      if (String(buyerTeam._id) === String(listing.sellerTeamId)) {
        throw new HttpError(httpStatus.BAD_REQUEST, "Cannot buy your own player");
      }
      const sellerTeam = await TeamModel.findById(listing.sellerTeamId).session(session).exec();
      if (!sellerTeam) {
        throw new HttpError(httpStatus.NOT_FOUND, "Seller team not found");
      }

      const player = sellerTeam.players.id(listing.playerId) as PlayerSubdoc | null;
      if (!player) {
        throw new HttpError(httpStatus.NOT_FOUND, "Player not found on seller team");
      }

      const price = Math.floor(listing.askingPrice * TRANSFER_BUY_DISCOUNT);
      if (buyerTeam.budget < price) {
        throw new HttpError(httpStatus.BAD_REQUEST, "Insufficient budget");
      }

      // roster size constraints: 15-25
      const buyerCount = buyerTeam.players.length;
      const sellerCount = sellerTeam.players.length;
      if (buyerCount + 1 > TEAM_MAX_PLAYERS) {
        throw new HttpError(httpStatus.BAD_REQUEST, "Buyer would exceed 25 players");
      }
      if (sellerCount - 1 < TEAM_MIN_PLAYERS) {
        throw new HttpError(httpStatus.BAD_REQUEST, "Seller would drop below 15 players");
      }

      // Move player
      sellerTeam.players.id(listing.playerId)?.deleteOne();
      buyerTeam.players.push({
        name: player.name,
        position: player.position,
        price,
        onTransferList: false,
      } as unknown as PlayerSubdoc);

      // Update budgets
      buyerTeam.budget -= price;
      sellerTeam.budget += price;

      await sellerTeam.save({ session });
      await buyerTeam.save({ session });
      await TransferListingModel.deleteOne({ _id: listing._id }).session(session).exec();
    });
    session.endSession();
  },
};


