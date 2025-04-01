// client/schemas/auth.tsx
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirm_password: z.string().min(8), // Changed to confirm_password
  role: z.string(),
}).refine((data) => data.password === data.confirm_password, { // Changed to confirm_password
  message: "Passwords do not match",
  path: ["confirm_password"], // Changed to confirm_password
});
