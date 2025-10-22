import { Router } from "express";
import { teamController } from "../../controllers/team.controller";
import { requireAuth } from "../../middlewares/requireAuth";

export const router = Router();

router.use(requireAuth);

router.get("/", teamController.getMyTeam);
