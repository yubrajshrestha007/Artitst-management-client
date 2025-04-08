// /home/mint/Desktop/ArtistMgntFront/client/shared/api/manager-profile.ts
import { ManagerProfile } from "@/types/auth";
import { apiRequest, getHeaders } from "./api-utils";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined in .env.local");
}

export const fetchManagerProfile = async (
  id: string
): Promise<ManagerProfile> => {
  const response = await fetch(`${BASE_URL}manager-profile/${id}/`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch manager profile");
  }
  return response.json();
};

export const createManagerProfile = async (
  data: Partial<ManagerProfile>
): Promise<ManagerProfile> => {
  const response = await fetch(`${BASE_URL}manager-profile/create/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create manager profile");
  }
  return response.json();
};

export const updateManagerProfile = async (
  id: string,
  data: Partial<ManagerProfile>
): Promise<ManagerProfile> => {
  console.log("Data being sent to apiRequest:", data);
  const response = await fetch(`${BASE_URL}manager-profile/${id}/`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to update manager profile");
  }

  return response.json();
};

export const deleteManagerProfile = async (id: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}manager-profile/${id}/`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to delete manager profile");
  }
};

export const fetchAllManagerProfiles = async (): Promise<{
  managers: ManagerProfile[];
}> => {
  try {
    const result = await apiRequest<{ managers: ManagerProfile[] }>(
      "manager-profile/all/",
      "GET"
    );
    return result;
  } catch (error) {
    console.error("Error fetching all manager profiles:", error);
    throw error;
  }
};
