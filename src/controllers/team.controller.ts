import { Response } from "express";
import { teamService } from "../services/team.service";
import { AuthenticatedRequest } from "../middlewares/requireAuth";

export const teamController = {
  async getMyTeam(req: AuthenticatedRequest, res: Response): Promise<void> {
    const team = await teamService.getMyTeam(req.userId!);
    res.success(team, "Team retrieved successfully");
  },
};
