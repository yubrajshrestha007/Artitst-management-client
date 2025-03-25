// hooks/login-form.ts
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/schemas/auth";
import { LoginSchema } from "@/types/auth";
import { useLoginMutation } from "@/shared/queries/auth";
import Cookies from 'js-cookie'; // Import js-cookie

export const useLoginForm = () => {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { mutate: login, isPending } = useLoginMutation({
    onSuccess: (data) => {
      console.log("Login successful:", data);
      setApiError(null);
      Cookies.set('access', data.access, { expires: 7 }); // Set the access token as a cookie, expires in 7 days
      Cookies.set('refresh', data.refresh, { expires: 7 }); // Set the refresh token as a cookie, expires in 7 days
      Cookies.set('role', data.role, { expires: 7 }); // Set the role as a cookie, expires in 7 days
      setIsAuthenticated(true);
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

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

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
