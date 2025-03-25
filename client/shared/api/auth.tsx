// /home/mint/Desktop/ArtistMgntFront/client/shared/api/auth.tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  LoginSchema,
  RegisterSchema,
  LoginResponse,
  RegisterResponse,
} from "@/types/auth";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in .env.local");
}

export const loginApi = async (data: LoginSchema): Promise<LoginResponse> => {
  const response = await fetch(`${BASE_URL}login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Login failed");
  }
  const responseData = await response.json();
  return responseData;
};

export const registerApi = async (
  data: RegisterSchema
): Promise<RegisterResponse> => {
  const response = await fetch(`${BASE_URL}register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Registration failed");
  }

  return response.json();
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      Cookies.remove("access");
      Cookies.remove("refresh");
      Cookies.remove("role");


      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      router.push("/login");
    },
  });
};
