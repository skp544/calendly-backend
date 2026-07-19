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

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const listBookingsQuerySchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
  from: dateString.optional(),
  to: dateString.optional(),
});

export type ListBookingsQueryDto = z.infer<typeof listBookingsQuerySchema>;
