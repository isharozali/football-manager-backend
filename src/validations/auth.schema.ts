import { z } from "zod";

export const loginOrRegisterSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
});

export type LoginOrRegisterInput = z.infer<typeof loginOrRegisterSchema>;
