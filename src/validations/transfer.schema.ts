import { z } from "zod";

export const transferListQuerySchema = z.object({
  playerName: z.string().trim().min(1).max(100).optional(),
  teamName: z.string().trim().min(1).max(100).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
});

export const listBodySchema = z.object({
  playerId: z.string().min(1),
  askingPrice: z.number().int().positive(),
});

export const unListBodySchema = z.object({
  playerId: z.string().min(1),
});

export const buyBodySchema = z.object({
  listingId: z.string().min(1),
});
