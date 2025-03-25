// shared/queries/auth.ts
import { useMutation } from "@tanstack/react-query";
import { loginApi, registerApi } from "@/shared/api/auth";
import { RegisterResponse, RegisterSchema, UseLoginMutationOptions } from "@/types/auth";

export const useLoginMutation = ({
  onSuccess,
  onError,
}: UseLoginMutationOptions = {}) => {
  return useMutation({
    mutationFn: loginApi,
    onSuccess,
    onError,
  });
};

interface UseRegisterMutationOptions {
  onSuccess?: (data: RegisterResponse) => void;
  onError?: (error: { message: string }) => void;
}

export const useRegisterMutation = ({
  onSuccess,
  onError,
}: UseRegisterMutationOptions = {}) => {
  return useMutation({
    mutationFn: (data: RegisterSchema) => registerApi(data),
    onSuccess,
    onError,
  });
};
