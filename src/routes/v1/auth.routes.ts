import { Router } from "express";
import { authController } from "../../controllers/auth.controller";
import { validate } from "../../middlewares/validate";
import { loginOrRegisterSchema } from "../../validations/auth.schema";
import rateLimit from "express-rate-limit";

export const router = Router();

const authRateLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

router.post(
  "/",
  authRateLimiter,
  validate("body", loginOrRegisterSchema),
  authController.loginOrRegister,
);
