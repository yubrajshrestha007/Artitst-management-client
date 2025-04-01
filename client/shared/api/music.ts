// /home/mint/Desktop/ArtistMgntFront/client/shared/api/music.ts
import Cookies from "js-cookie";
import { Music } from "@/types/auth";

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

export const fetchMusicList = async (): Promise<Music[]> => {
  return apiRequest("music/list/", "GET");
};

export const fetchMusic = async (id: string): Promise<Music> => {
  return apiRequest(`music/${id}/`, "GET");
};

export const createMusic = async (data: Music): Promise<Music> => {
  return apiRequest("music/", "POST", data);
};

export const updateMusic = async ({
  id,
  data,
}: {
  id: string;
  data: Music;
}): Promise<Music> => {
  return apiRequest(`music/${id}/`, "PUT", data);
};

export const deleteMusic = async (id: string): Promise<void> => {
  await apiRequest(`music/${id}/`, "DELETE");
};
