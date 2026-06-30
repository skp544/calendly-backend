import { z } from "zod";

export const createAvailabilityRuleSchema = z.object({
  weekday: z.number().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  timezone: z.string().default("UTC"),
});

export const updateAvailabilityRuleSchema =
  createAvailabilityRuleSchema.partial();

export type createAvailabilityRuleDto = z.infer<
  typeof createAvailabilityRuleSchema
>;

export type updateAvailabilityRuleDto = z.infer<
  typeof updateAvailabilityRuleSchema
>;
