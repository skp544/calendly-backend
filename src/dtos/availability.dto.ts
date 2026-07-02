import { z } from "zod";

const timeString = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format");

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const createAvailabilityRuleSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startTime: timeString,
  endTime: timeString,
  timezone: z.string().default("UTC"),
  isActive: z.boolean().default(true),
});

export const updateAvailabilityRuleSchema =
  createAvailabilityRuleSchema.partial();

export type createAvailabilityRuleDto = z.infer<
  typeof createAvailabilityRuleSchema
>;
export type updateAvailabilityRuleDto = z.infer<
  typeof updateAvailabilityRuleSchema
>;

export const createAvailabilityExceptionSchema = z.object({
  date: dateString,
  type: z.enum(["BLOCK_FULL_DAY", "BLOCK_PARTIAL", "ADD_AVAILABLE_WINDOW"]),
  startTime: timeString.optional(),
  endTime: timeString.optional(),
  timezone: z.string().default("UTC"),
  reason: z.string().min(1).max(500),
});

export const updateAvailabilityExceptionSchema =
  createAvailabilityExceptionSchema.partial();

export type createAvailabilityExceptionDto = z.infer<
  typeof createAvailabilityExceptionSchema
>;
export type updateAvailabilityExceptionDto = z.infer<
  typeof updateAvailabilityExceptionSchema
>;
