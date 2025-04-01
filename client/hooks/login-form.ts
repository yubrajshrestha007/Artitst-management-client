// hooks/login-form.ts
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/schemas/auth";
import { LoginSchema } from "@/types/auth";
import { useLoginMutation } from "@/shared/queries/auth";
import Cookies from 'js-cookie';
import { useQueryClient } from "@tanstack/react-query";
import { prefetchProfile } from "@/shared/queries/profiles";

export const useLoginForm = () => {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { mutate: login, isPending } = useLoginMutation({
    onSuccess: async (data) => {
      console.log("Login successful:", data);
      setApiError(null);
      Cookies.set('access', data.access, { expires: 7 });
      Cookies.set('refresh', data.refresh, { expires: 7 });
      Cookies.set('role', data.role, { expires: 7 });
      // Prefetch the profile after successful login
      await prefetchProfile(queryClient);
      router.push("/dashboard");
    },
    onError: (error: { message: string }) => {
      console.error("Login failed:", error);
      setApiError(error.message || "An error occurred during login.");
    },
  });

  const onSubmit = (data: LoginSchema): void => {
    setApiError(null);
    login(data);
  };

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    apiError,
    isPending,
    onSubmit,
  };
};
