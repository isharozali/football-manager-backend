import { Router } from "express";
import { router as authRouter } from "./v1/auth.routes";
import { router as teamRouter } from "./v1/team.routes";
import { router as transferRouter } from "./v1/transfer.routes";

export const router = Router();

router.use("/v1/auth", authRouter);
router.use("/v1/teams", teamRouter);
router.use("/v1/transfers", transferRouter);
