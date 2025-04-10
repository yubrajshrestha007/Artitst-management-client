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

export const managerProfileDefaultValues: Partial<ManagerProfileFormValues> = {
  name: "",
  company_name: "",
  company_email: "",
  company_phone: "",
  gender: null,
  address: null,
  date_of_birth: null,
};

// Helper to format date for input type="date"
export const formatDateForInput = (date: string | Date | null | undefined): string => {
  if (!date) return "";
  try {
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};
// schemas/auth.ts (or similar)
import * as z from "zod";

export const userFormSchema = z.object({
  id: z.string().optional(), // Only present in edit mode
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional(),
  confirm_password: z.string().optional(),
  is_active: z.boolean().default(true),
  role: z.enum(["artist", "artist_manager"], {
    required_error: "Role is required.",
  }),
}).refine((data) => {
  // If password exists, confirm_password must match
  if (data.password && data.password !== data.confirm_password) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirm_password"], // Set error on confirm_password field
});

export type UserFormValues = z.infer<typeof userFormSchema>;

export const userFormDefaultValues: Partial<UserFormValues> = {
  email: "",
  password: "",
  confirm_password: "",
  is_active: true,
  role: undefined, // Start with undefined or a default based on context
};
