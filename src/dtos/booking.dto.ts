import { z } from "zod";

export const createBookSchema = z.object({
  slotId: z.string(),
  inviteeEmail: z.email("Invalid Email Address"),
  inviteeName: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less that 100 characters"),
  inviteeNotes: z.string().optional(),
});

export type CreateBookingDto = z.infer<typeof createBookSchema>;
