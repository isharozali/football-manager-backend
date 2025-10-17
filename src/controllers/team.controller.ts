import { Response } from "express";
import httpStatus from "http-status";
import { teamService } from "../services/team.service";
import { AuthenticatedRequest } from "../middlewares/requireAuth";

export const teamController = {
  async getMyTeam(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
      return;
    }
    const team = await teamService.getMyTeam(userId);
    res.status(httpStatus.OK).json({ team });
  },

  async enqueueTeamCreation(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
      return;
    }
    const result = await teamService.enqueueCreation(userId);
    res.status(httpStatus.ACCEPTED).json(result);
  },
};


