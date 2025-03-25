// /home/mint/Desktop/ArtistMgntFront/client/shared/queries/manager-profile.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "@/types/auth";

export interface ManagerProfile {
  id?: string; // Add id to ManagerProfile
  name: string;
  company_name: string;
  company_email: string;
  company_phone: string;
  gender: string;
  address: string;
  date_of_birth: string | null;
  user_id: number | null;
  manager_id?: string;
}

const fetchManagerProfile = async (access: string, id: string) => {
  const response = await fetch(
    `http://localhost:8000/api/manager-profile/${id}/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch manager profile");
  }

  return response.json();
};

const fetchMyManagerProfile = async (access: string) => {
  const decodedToken: DecodedToken = jwtDecode(access);
  const userId = decodedToken.user_id;

  if (!userId) {
    throw new Error("User ID not found in access token");
  }
  const response = await fetch(
    `http://localhost:8000/api/manager-by-user/${userId}/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch manager profile");
  }

  return response.json();
};

export const useManagerProfileQuery = (id: string) => {
  const access = Cookies.get("access");
  return useQuery<ManagerProfile, Error>({
    queryKey: ["manager-profile", id],
    queryFn: () => fetchManagerProfile(access || "", id),
    enabled: !!access && !!id,
  });
};

export const useMyManagerProfileQuery = () => {
  const access = Cookies.get("access");
  return useQuery<ManagerProfile, Error>({
    queryKey: ["my-manager-profile"],
    queryFn: () => fetchMyManagerProfile(access || ""),
    enabled: !!access,
  });
};

const createManagerProfile = async (data: ManagerProfile) => {
  const access = Cookies.get("access");

  const response = await fetch(
    "http://localhost:8000/api/manager-profile/create/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create manager profile");
  }

  return response.json();
};

const updateManagerProfile = async ({
  id,
  data,
}: {
  id: string;
  data: ManagerProfile;
}) => {
  const access = Cookies.get("access");

  const response = await fetch(
    `http://localhost:8000/api/manager-profile/${id}/`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update manager profile");
  }

  return response.json();
};

const deleteManagerProfile = async (id: string) => {
  const access = Cookies.get("access");

  const response = await fetch(
    `http://localhost:8000/api/manager-profile/${id}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete manager profile");
  }
  if (response.status==204) {
    return null;
  }
  return response.json()
};

interface UseCreateManagerProfileMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: { message: string }) => void;
}

interface UseUpdateManagerProfileMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: { message: string }) => void;
}

interface UseDeleteManagerProfileMutationOptions {
  onSuccess?: () => void;
  onError?: (error: { message: string }) => void;
}

export const useCreateManagerProfileMutation = ({
  onSuccess,
  onError,
}: UseCreateManagerProfileMutationOptions = {}) => {
  return useMutation({
    mutationFn: createManagerProfile,
    onSuccess,
    onError,
  });
};

export const useUpdateManagerProfileMutation = ({
  onSuccess,
  onError,
}: UseUpdateManagerProfileMutationOptions = {}) => {
  return useMutation({
    mutationFn: updateManagerProfile,
    onSuccess,
    onError,
  });
};

export const useDeleteManagerProfileMutation = ({
  onSuccess,
  onError,
}: UseDeleteManagerProfileMutationOptions = {}) => {
  return useMutation({
    mutationFn: deleteManagerProfile,
    onSuccess,
    onError,
  });
};
