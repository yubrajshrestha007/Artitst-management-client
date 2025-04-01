"use client"
import { registerSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { ROLES } from "@/lib/roles";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useRegisterMutation } from "@/shared/queries/auth";

export const useRegisterForm = () => {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirm_password: "", // Changed to confirm_password
      role: "",
    },
  });

  const { mutate: registerUser, isPending: isRegistering } = useRegisterMutation({
    onSuccess: (data) => {
      console.log("Registration successful:", data);
      alert("Registration successful!");
      router.push("/login");
      setApiError(null);
      reset();
    },
    onError: (error: { message: string }) => {
      console.error("Registration failed:", error);
      setApiError(error.message || "An error occurred during registration.");
    },
  });

  const onSubmit = (data: z.infer<typeof registerSchema>) => {
    setApiError(null);
    registerUser(data); // Send the entire data object
  };

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    apiError,
    onSubmit,
    roles: ROLES,
    isRegistering,
  };
};
