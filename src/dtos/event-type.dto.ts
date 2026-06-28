import { z } from "zod";

export const createEventTypeSchema = z.object({
  title: z
    .string()
    .min(1, "Title must be at least 1 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),

  durationMinutes: z.number().min(15).max(120).default(30),

  isActive: z.boolean().default(true),

  locationType: z.enum(["online", "offline"]).default("online"),
  locationValue: z.string().optional(),

  bufferMoreMinutes: z.number().min(0).max(120).default(0),
  bufferLessMinutes: z.number().min(0).max(120).default(0),

  slug: z
    .string()
    .min(1, "Slug must be at least 1 characters")
    .max(100, "Slug must be less than 100 characters")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Slug must be lowercase and can only contain letters, numbers, and hyphens",
    ),
});

export const updateEventTypeSchema = createEventTypeSchema.partial();

export type createEventTypeDto = z.infer<typeof createEventTypeSchema>;

export type updateEventTypeDto = z.infer<typeof updateEventTypeSchema>;
