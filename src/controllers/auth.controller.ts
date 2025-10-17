import { Request, Response } from "express";
import httpStatus from "http-status";
import { authService } from "../services/auth.service";

export const authController = {
  async loginOrRegister(req: Request, res: Response): Promise<void> {
    const result = await authService.loginOrRegister(req.body);
    res.status(httpStatus.OK).json(result);
  },
};


