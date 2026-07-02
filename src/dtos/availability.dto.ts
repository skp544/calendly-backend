import { z } from "zod";

const timeString = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format");

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

const createAvailabilityRuleBaseSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startTime: timeString,
  endTime: timeString,
  timezone: z.string().default("UTC"),
  isActive: z.boolean().default(true),
});

export const createAvailabilityRuleSchema =
  createAvailabilityRuleBaseSchema.refine(
    (rule) => rule.startTime < rule.endTime,
    {
      message: "Start time must be before end time",
    },
  );

export const updateAvailabilityRuleSchema =
  createAvailabilityRuleBaseSchema.partial();

export type createAvailabilityRuleDto = z.infer<
  typeof createAvailabilityRuleSchema
>;
export type updateAvailabilityRuleDto = z.infer<
  typeof updateAvailabilityRuleSchema
>;

const createAvailabilityExceptionBaseSchema = z.object({
  date: dateString,
  type: z.enum(["BLOCK_FULL_DAY", "BLOCK_PARTIAL", "ADD_AVAILABLE_WINDOW"]),
  startTime: timeString.optional(),
  endTime: timeString.optional(),
  timezone: z.string().default("UTC"),
  reason: z.string().min(1).max(500),
});

export const createAvailabilityExceptionSchema =
  createAvailabilityExceptionBaseSchema.superRefine((data, ctx) => {
    if (data.type !== "BLOCK_FULL_DAY") {
      if (!data.startTime) {
        ctx.addIssue({
          path: ["startTime"],
          message: "Start time is required for a non full day exception",
          code: "custom",
        });
      }

      if (!data.endTime) {
        ctx.addIssue({
          path: ["endTime"],
          message: "End time is required for a non full day exception",
          code: "custom",
        });
      }

      if (data.startTime && data.endTime && data.startTime >= data.endTime) {
        ctx.addIssue({
          path: ["startTime"],
          message: "Start time must be before end time",
          code: "custom",
        });
      }
    }
  });

export const updateAvailabilityExceptionSchema =
  createAvailabilityExceptionBaseSchema.partial();

export type createAvailabilityExceptionDto = z.infer<
  typeof createAvailabilityExceptionSchema
>;
export type updateAvailabilityExceptionDto = z.infer<
  typeof updateAvailabilityExceptionSchema
>;
