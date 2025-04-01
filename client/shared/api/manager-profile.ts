// /home/mint/Desktop/ArtistMgntFront/client/shared/api/manager-profile.ts
import { ManagerProfile } from "@/types/auth";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined in .env.local");
}

const getHeaders = () => {
  const accessToken = Cookies.get("access");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
};

export const fetchManagerProfile = async (id: string): Promise<ManagerProfile> => {
  const response = await fetch(`${BASE_URL}manager-profile/${id}/`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch manager profile");
  }
  return response.json();
};

export const createManagerProfile = async (data: Partial<ManagerProfile>): Promise<ManagerProfile> => {
  const response = await fetch(`${BASE_URL}manager-profile/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create manager profile");
  }
  return response.json();
};

export const updateManagerProfile = async (data: Partial<ManagerProfile>): Promise<ManagerProfile> => {
  const response = await fetch(`${BASE_URL}manager-profile/${data.id}/`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update manager profile");
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

export const fetchAllManagerProfiles = async (): Promise<{ managers: ManagerProfile[] }> => {
  const response = await fetch(`${BASE_URL}manager-profile/all/`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch all manager profiles");
  }
  return response.json();
};
