import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { UserModel, UserDocument } from "../models/user.model";
import { loginOrRegisterSchema, LoginOrRegisterInput } from "../validations/auth.schema";
import { signAccessToken } from "../utils/jwt";
import { HttpError } from "../middlewares/error";
import { env } from "../config/env.js";

export interface AuthResult {
  user: { id: string; email: string };
  accessToken: string;
}

export const authService = {
  async loginOrRegister(input: LoginOrRegisterInput): Promise<AuthResult> {
    const parsed = loginOrRegisterSchema.safeParse(input);
    if (!parsed.success) {
      throw new HttpError(httpStatus.BAD_REQUEST, "Invalid auth input", parsed.error.format());
    }

    const { email, password } = parsed.data;

    let user: UserDocument | null = await UserModel.findOne({ email }).exec();
    if (!user) {
      const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
      user = await UserModel.create({ email, passwordHash });
    } else {
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        throw new HttpError(httpStatus.UNAUTHORIZED, "Invalid credentials");
      }
    }

    const token = signAccessToken(String(user._id));
    return { user: { id: String(user._id), email: user.email }, accessToken: token };
  },
};
