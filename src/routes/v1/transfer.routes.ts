import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { transferController } from "../../controllers/transfer.controller";
import { validate } from "../../middlewares/validate";
import {
  transferListQuerySchema,
  listBodySchema,
  unListBodySchema,
  buyBodySchema,
} from "../../validations/transfer.schema";

export const router = Router();

router.use(requireAuth);
router.get("/", validate("query", transferListQuerySchema), transferController.list);
router.post("/list", validate("body", listBodySchema), transferController.addToMarket);
router.post("/un-list", validate("body", unListBodySchema), transferController.removeFromMarket);
router.post("/buy", validate("body", buyBodySchema), transferController.buy);
