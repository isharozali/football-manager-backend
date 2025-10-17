import { Request, Response } from "express";
import httpStatus from "http-status";
import { transferService } from "../services/transfer.service";
import { AuthenticatedRequest } from "../middlewares/requireAuth";

export const transferController = {
  async list(req: Request, res: Response): Promise<void> {
    const { playerName, minPrice, maxPrice, teamName } = req.query;
    const listings = await transferService.list({
      playerName: typeof playerName === "string" ? playerName : undefined,
      teamName: typeof teamName === "string" ? teamName : undefined,
      minPrice: typeof minPrice === "string" ? Number(minPrice) : undefined,
      maxPrice: typeof maxPrice === "string" ? Number(maxPrice) : undefined,
    });
    res.status(httpStatus.OK).json({ listings });
  },

  async addToMarket(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
      return;
    }
    const { playerId, askingPrice } = req.body as { playerId?: string; askingPrice?: number };
    if (typeof playerId !== "string" || playerId.length === 0) {
      res.status(httpStatus.BAD_REQUEST).json({ message: "playerId is required" });
      return;
    }
    if (typeof askingPrice !== "number" || askingPrice <= 0) {
      res.status(httpStatus.BAD_REQUEST).json({ message: "askingPrice must be > 0" });
      return;
    }
    await transferService.addToMarket(userId, playerId, askingPrice);
    res.status(httpStatus.OK).json({ message: "Listed" });
  },

  async removeFromMarket(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
      return;
    }
    const { playerId } = req.body as { playerId?: string };
    if (typeof playerId !== "string" || playerId.length === 0) {
      res.status(httpStatus.BAD_REQUEST).json({ message: "playerId is required" });
      return;
    }
    await transferService.removeFromMarket(userId, playerId);
    res.status(httpStatus.OK).json({ message: "Unlisted" });
  },

  async buy(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
      return;
    }
    const { listingId } = req.body as { listingId?: string };
    if (typeof listingId !== "string" || listingId.length === 0) {
      res.status(httpStatus.BAD_REQUEST).json({ message: "listingId is required" });
      return;
    }
    await transferService.buy(userId, listingId);
    res.status(httpStatus.OK).json({ message: "Purchased" });
  },
};
