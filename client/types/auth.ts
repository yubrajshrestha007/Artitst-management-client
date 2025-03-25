// types/auth.ts
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
  id: number;
  email: string;
  password:string;
  confirm_password:string;
  role: string;
}

export interface DecodedToken {
  role?: string;
}

export interface UserQueryResponse {
  users: User[];
  currentUserRole: string;
}
export interface UseLoginMutationOptions {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: { message: string }) => void;
}
