import { Request, Response } from "express";
import { authService } from "../services/auth.service";

export const authController = {
  async loginOrRegister(req: Request, res: Response): Promise<void> {
    const { data, message } = await authService.loginOrRegister(req.body);
    res.success(data, message);
  },
};
