import { z } from "zod";

export const tradeSchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(1)
    .max(20)
    .regex(/^[A-Za-z0-9._-]+$/, "Symbol contains invalid characters")
    .transform((value) => value.toUpperCase()),
  quantity: z.coerce.number().int().positive()
});
