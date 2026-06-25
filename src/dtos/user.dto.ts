import { z } from "zod";

export const createUserSchema = z.object({
  email: z.email("Invalid Email Address"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
});

export type createUserDto = z.infer<typeof createUserSchema>;
