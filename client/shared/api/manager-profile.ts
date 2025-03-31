// /home/mint/Desktop/ArtistMgntFront/client/shared/api/manager-profile.ts
import { ManagerProfile } from "@/types/auth";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined in .env.local");
}

const apiRequest = async (
  url: string,
  method: string,
  data?: any
): Promise<any> => {
  const access = Cookies.get("access");
  if (!access) {
    throw new Error("Access token not found");
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.detail || "API request failed");
    } catch (error) {
      throw new Error("API request failed");
    }
  }

  if (response.status === 204) {
    return null; // Return null for 204 No Content
  }

  return response.json();
};

export const fetchManagerProfile = async (id: string): Promise<ManagerProfile> => {
  return apiRequest(`manager-profile/${id}/`, "GET");
};

export const createManagerProfile = async (
  data: ManagerProfile
): Promise<ManagerProfile> => {
  return apiRequest("manager-profile/create/", "POST", data);
};

export const updateManagerProfile = async ({
  id,
  data,
}: {
  id: string;
  data: ManagerProfile;
}): Promise<ManagerProfile> => {
  return apiRequest(`manager-profile/${id}/`, "PUT", data);
};

export const deleteManagerProfile = async (id: string): Promise<void> => {
  await apiRequest(`manager-profile/${id}/`, "DELETE");
};
