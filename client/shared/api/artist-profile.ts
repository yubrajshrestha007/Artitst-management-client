// /home/mint/Desktop/ArtistMgntFront/client/shared/api/artist-profile.ts
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { ArtistProfile, DecodedToken } from "@/types/auth";

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

export const fetchArtistProfile = async (id: string): Promise<ArtistProfile> => {
  return apiRequest(`artists/${id}/`, "GET");
};

export const createArtistProfile = async (
  data: ArtistProfile
): Promise<ArtistProfile> => {
  return apiRequest("artists/", "POST", data);
};

export const updateArtistProfile = async ({
  id,
  data,
}: {
  id: string;
  data: ArtistProfile;
}): Promise<ArtistProfile> => {
  return apiRequest(`artists/${id}/`, "PUT", data);
};

export const deleteArtistProfile = async (id: string): Promise<void> => {
  await apiRequest(`artists/${id}/`, "DELETE");
};
