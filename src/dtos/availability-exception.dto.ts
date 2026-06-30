import { z } from "zod";

export const createAvailabilityExceptionSchema = z.object({
  date: z.date(),
  type: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  timezone: z.string().default("UTC"),
  reason: z.string(),
});

export const updateAvailabilityExceptionSchema =
  createAvailabilityExceptionSchema.partial();

export type createAvailabilityExceptionDto = z.infer<
  typeof createAvailabilityExceptionSchema
>;

export type updateAvailabilityExceptionDto = z.infer<
  typeof updateAvailabilityExceptionSchema
>;
