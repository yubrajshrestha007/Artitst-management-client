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
  id: number;
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
export interface UserQueryResponse {
  users: User[];
  currentUserRole: string;
}
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


export interface ManagerProfile {
  id?: string;
  name: string;
  company_name: string;
  company_email: string;
  company_phone: string;
  gender: string;
  address: string;
  date_of_birth: string | null;
}
export interface ArtistProfile {
  id?: string;
  name: string| undefined;
  date_of_birth: string | null;
  gender: string;
  address: string;
  first_release_year: number | null;
  no_of_albums_released: number;
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
