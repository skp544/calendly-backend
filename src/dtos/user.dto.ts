import { z } from "zod";

export const createUserSchema = z.object({
  email: z.email("Invalid Email Address"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
});

export type createUserDto = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    email: z.email("Invalid Email Address").optional(),
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters")
      .optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: "At least one field (name or email) must be provided",
  });

export type updateUserDto = z.infer<typeof updateUserSchema>;
