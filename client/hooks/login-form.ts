// hooks/login-form.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LoginSchema, LoginResponse } from "@/types/auth";
import { loginApi } from "@/shared/api/auth";
import Cookies from "js-cookie";
import { prefetchArtistProfile, prefetchManagerProfile } from "@/shared/queries/profiles";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schemas/auth";
import { z } from "zod";

export const useLoginForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const {
    formState: { errors, isSubmitting },
    reset,
    control,
  } = form;

  const { mutate: loginUser, isPending, error } = useMutation({
    mutationFn: async (data: LoginSchema): Promise<LoginResponse> => {
      const response = await loginApi(data);
      Cookies.set("access", response.access);
      Cookies.set("refresh", response.refresh);
      const role = response.role;
      Cookies.set("role", role);
      return response;
    },
    onSuccess: async (data) => {
      const role = data.role;
      if (role === "artist") {
        await prefetchArtistProfile(queryClient);
      } else if (role === "artist_manager") {
        await prefetchManagerProfile(queryClient);
      }
      router.push("/dashboard");
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || "Login failed");
    },
  });

  return {
    form,
    errors,
    isSubmitting,
    isPending,
    control,
    apiError: error?.message,
    loginUser,
  };
};
