import { Router } from "express";
import { teamController } from "../../controllers/team.controller";
import { requireAuth } from "../../middlewares/requireAuth";

export const router = Router();

router.get("/me", requireAuth, teamController.getMyTeam);
router.post("/create-job", requireAuth, teamController.enqueueTeamCreation);
