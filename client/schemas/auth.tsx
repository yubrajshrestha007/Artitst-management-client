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

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirm_password: z.string().min(8),
  role: z.string(),
  is_active: z.boolean(),
});

// Helper to validate YYYY-MM-DD format and ensure it's a valid date
const isValidDateString = (val: string | null | undefined): boolean => {
  if (!val) return true; // Allow null/undefined
  return /^\d{4}-\d{2}-\d{2}$/.test(val) && !isNaN(new Date(val).getTime());
};

export const artistProfileSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  date_of_birth: z.string().nullable().refine(isValidDateString, {
    message: "Invalid date format (YYYY-MM-DD)",
  }).optional(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  address: z.string().optional().nullable(),
  first_release_year: z.number().int().min(1900).max(new Date().getFullYear()).nullable().optional(),
  no_of_albums_released: z.number().int().min(0).nullable().optional(),
  manager_id_id: z.string().nullable().optional(), // Manager ID is optional
  // user_id is not part of the form data itself, handled during submission
});

export type ArtistProfileFormValues = z.infer<typeof artistProfileSchema>;

// Add Manager Profile Schema if not already defined
export const managerProfileSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  company_name: z.string().min(1, { message: "Company name is required" }),
  company_email: z.string().email({ message: "Invalid company email address" }),
  company_phone: z.string().min(1, { message: "Company phone is required" }),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  address: z.string().optional().nullable(),
  date_of_birth: z.string().nullable().refine(isValidDateString, {
    message: "Invalid date format (YYYY-MM-DD)",
  }).optional(),
});

export type ManagerProfileFormValues = z.infer<typeof managerProfileSchema>;
