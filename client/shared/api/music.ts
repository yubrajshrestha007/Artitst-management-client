// /home/mint/Desktop/ArtistMgntFront/client/shared/api/music.ts
import Cookies from "js-cookie";
import { Music } from "@/types/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined in .env.local");
}

const apiRequest = async <T>(
  url: string,
  method: string,
  data?: unknown
): Promise<T | null> => {
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
    } catch {
      throw new Error("API request failed");
    }
  }

  if (response.status === 204) {
    return null;
  }

  return response.json() as Promise<T>;
};

export const fetchMusicList = async (): Promise<Music[]> => {
  const result = await apiRequest<Music[]>("music/list/", "GET");
  return result || [];
};

export const fetchMusic = async (id: string): Promise<Music> => {
  const result = await apiRequest<Music | null>(`music/${id}/`, "GET");
  if (!result) {
    throw new Error(`Music with id ${id} not found`);
  }
  return result;
};

export const createMusic = async (data: Music): Promise<Music> => {
  const result = await apiRequest<Music | null>("music/", "POST", data);
  if (!result) {
    throw new Error("Failed to create music");
  }
  return result;
};

export const updateMusic = async ({
  id,
  data,
}: {
  id: string;
  data: Music;
}): Promise<Music> => {
  const result = await apiRequest<Music | null>(`music/${id}/`, "PUT", data);
  if (!result) {
    throw new Error(`Failed to update music with id ${id}`);
  }
  return result;
};

export const deleteMusic = async (id: string): Promise<void> => {
  await apiRequest(`music/${id}/`, "DELETE");
};
