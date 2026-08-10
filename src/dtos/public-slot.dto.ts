import { z } from "zod";

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const listPublicSlotsQuerySchema = z.object({
  from: dateString.optional(),
  to: dateString.optional(),
});

export type ListPublicSlotsQueryDto = z.infer<typeof listPublicSlotsQuerySchema>;
