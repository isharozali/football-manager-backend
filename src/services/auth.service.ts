import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { UserModel, UserDocument } from "../models/user.model";
import { loginOrRegisterSchema, LoginOrRegisterInput } from "../validations/auth.schema";
import { signAccessToken } from "../utils/jwt";
import { HttpError } from "../middlewares/error";
import { env } from "../config/env.js";
import { JobModel } from "../models/job.model";

export interface AuthResult {
  data: {
    user: { id: string; email: string };
    accessToken: string;
    expiresIn: string;
  };
  message: string;
}

export const authService = {
  async loginOrRegister(input: LoginOrRegisterInput): Promise<AuthResult> {
    const parsed = loginOrRegisterSchema.safeParse(input);
    if (!parsed.success) {
      throw new HttpError(httpStatus.BAD_REQUEST, "Invalid auth input", parsed.error.issues);
    }

    const { email, password } = parsed.data;
    let isNewUser = false;
    let user: UserDocument | null = await UserModel.findOne({ email }).exec();
    if (!user) {
      const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
      user = await UserModel.create({ email, passwordHash });
      await JobModel.create({
        type: "create-team",
        payload: { userId: String(user._id) },
      });
      isNewUser = true;
    } else {
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        throw new HttpError(httpStatus.UNAUTHORIZED, "Invalid credentials");
      }
    }

    const accessToken = signAccessToken(String(user._id));
    return {
      data: {
        user: { id: String(user._id), email: user.email },
        accessToken,
        expiresIn: process.env.JWT_EXPIRES_IN ?? "15m",
      },
      message: isNewUser ? "Registration successful." : "Login successful.",
    };
  },
};
