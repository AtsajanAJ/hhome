import { z } from "zod";

export const profileNameSchema = z.string().trim().min(2).max(80);
export const profileEmailSchema = z.string().trim().toLowerCase().email().max(254);
export const profilePasswordSchema = z.string().min(8).max(72);

export const passwordChangeSchema = z.object({
  currentPassword: profilePasswordSchema,
  newPassword: profilePasswordSchema,
  confirmation: profilePasswordSchema,
});
