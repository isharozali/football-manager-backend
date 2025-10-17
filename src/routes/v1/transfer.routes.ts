import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { transferController } from "../../controllers/transfer.controller";
import { validate } from "../../middlewares/validate";
import {
  transferListQuerySchema,
  listBodySchema,
  unlistBodySchema,
  buyBodySchema,
} from "../../validations/transfer.schema";

export const router = Router();

router.get("/", requireAuth, validate("query", transferListQuerySchema), transferController.list);
router.post("/list", requireAuth, validate("body", listBodySchema), transferController.addToMarket);
router.post("/unlist", requireAuth, validate("body", unlistBodySchema), transferController.removeFromMarket);
router.post("/buy", requireAuth, validate("body", buyBodySchema), transferController.buy);


