import { Response } from "express";
import { transferService } from "../services/transfer.service";
import { AuthenticatedRequest } from "../middlewares/requireAuth";
import { TransferFilters } from "../services/transfer.service";
import { buyBodySchema, listBodySchema, unListBodySchema } from "../validations/transfer.schema";

export const transferController = {
  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    const listings = await transferService.list(req.query as TransferFilters);
    res.success(listings, "Listings retrieved successfully");
  },

  async addToMarket(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { playerId, askingPrice } = listBodySchema.parse(req.body);
    await transferService.addToMarket(req.userId!, playerId, askingPrice);
    res.success({}, "Player listed successfully");
  },

  async removeFromMarket(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { playerId } = unListBodySchema.parse(req.body);
    await transferService.removeFromMarket(playerId);
    res.success({}, "Player unlisted successfully");
  },

  async buy(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { listingId } = buyBodySchema.parse(req.body);
    await transferService.buy(req.userId!, listingId);
    res.success({}, "Player purchased successfully");
  },
};
