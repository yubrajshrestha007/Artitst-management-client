// /home/mint/Desktop/ArtistMgntFront/client/types/auth.ts
import { z } from "zod";
import { loginSchema, registerSchema } from "@/schemas/auth";

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export interface RegisterResponse {
  email: string;
  role: string;
}
export interface LoginResponse {
  access: string;
  refresh: string;
  role: string;
}

export interface User {
  is_active: boolean;
  id: string;
  email: string;
  password:string;
  confirm_password:string;
  role: string;
}

export interface DecodedToken {
  role?: string;
  user_id?: number;
}

export interface UseCreateManagerProfileMutationOptions {
  onSuccess?: (data: ManagerProfile) => void;
  onError?: (error: { message: string }) => void;
}

export interface UseUpdateManagerProfileMutationOptions {
  onSuccess?: (data: ManagerProfile) => void;
  onError?: (error: { message: string }) => void;
}

export interface UseDeleteManagerProfileMutationOptions {
  onSuccess?: () => void;
  onError?: (error: { message: string }) => void;
}
// export interface UserQueryResponse {
//   users: User[];
//   currentUserRole: string;
// }
export interface UseLoginMutationOptions {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: { message: string }) => void;
}

export interface UseCreateArtistProfileMutationOptions {
  onSuccess?: (data: ArtistProfile) => void;
  onError?: (error: { message: string }) => void;
}

export interface UseUpdateArtistProfileMutationOptions {
  onSuccess?: (data: ArtistProfile) => void;
  onError?: (error: { message: string }) => void;
}

export interface UseDeleteArtistProfileMutationOptions {
  onSuccess?: () => void;
  onError?: (error: { message: string }) => void;
}


// --- ADD THIS INTERFACE ---
export interface ManagerProfile {
  id?: string; // Optional for creation
  user_id?: string; // Needed for creation
  name?: string | null;
  date_of_birth?: string | Date | null;
  gender?: string | null;
  address?: string | null;
  company_name?: string | null;
  company_email?: string | null;
  company_phone?: string | null;
  created?: string | Date | null; // Added for dashboard card
  updated?: string | Date | null;
}
export interface ArtistProfile {
  id?: string;
  name: string| undefined;
  date_of_birth: string | null;
  gender: string;
  address: string;
  first_release_year: number | null;
  no_of_albums_released: number;
  created?: string | Date | null; // Added for dashboard card
  updated?: string | Date | null;
  manager_id_id: string | null;
  user_id?: string | null;
}

// Music Interface
export interface Music {
  created: Date;
  id?: string;
  title: string;
  album_name: string;
  artist_id?: string; // Foreign key to the artist profile
  genre: string;
  release_date: string | null;
  artist_name: string;
  created_by_id?: string | null;
}

export interface PaginatedResponse<T> {
  count: number;       // Total number of items across all pages
  next: string | null; // URL for the next page, or null if none
  previous: string | null; // URL for the previous page, or null if none
  results: T[];      // Array of items for the current page
}
export interface UserQueryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[]; // Changed from 'users' to 'results'
  currentUserRole: string; // Keep the role information
}
