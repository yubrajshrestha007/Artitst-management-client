// /home/mint/Desktop/ArtistMgntFront/client/shared/queries/profile.ts
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ArtistProfile, ManagerProfile } from "@/types/auth";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "@/types/auth";
import { toast } from "sonner";

type Profile = ArtistProfile | ManagerProfile | null;

const fetchMyArtistProfile = async (): Promise<ArtistProfile | null> => {
  const access = Cookies.get("access");
  if (!access) {
    throw new Error("Access token not found");
  }
  const decodedToken: DecodedToken = jwtDecode(access);
  const role = decodedToken.role;
  const userId = decodedToken.user_id; // Extract user_id

  if (!userId) {
    throw new Error("User ID not found in token");
  }
  if (role !== "artist") {
    return null;
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}artists/by-user/${userId}/`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
    },
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

const fetchMyManagerProfile = async (): Promise<ManagerProfile | null> => {
  const access = Cookies.get("access");
  if (!access) {
    throw new Error("Access token not found");
  }
  const decodedToken: DecodedToken = jwtDecode(access);
  const role = decodedToken.role;
  const userId = decodedToken.user_id; // Extract user_id

  if (!userId) {
    throw new Error("User ID not found in token");
  }
  if (role !== "artist_manager") {
    return null;
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}manager-by-user/${userId}/`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
    },
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

export const useMyArtistProfileQuery = (isAuthenticated: boolean) => {
  return useQuery<ArtistProfile | null, Error>({
    queryKey: ["my-artist-profile"],
    queryFn: fetchMyArtistProfile,
    enabled: isAuthenticated, // Only fetch if logged in
    retry: false, // Disable retries
    staleTime: Infinity, // Data is always fresh
    cacheTime: Infinity,
    onError: (error) => {
      toast.error(error.message || "Failed to fetch artist profile");
    },
  });
};

export const useMyManagerProfileQuery = (isAuthenticated: boolean) => {
  return useQuery<ManagerProfile | null, Error>({
    queryKey: ["my-manager-profile"],
    queryFn: fetchMyManagerProfile,
    enabled: isAuthenticated, // Only fetch if logged in
    retry: false, // Disable retries
    staleTime: Infinity, // Data is always fresh
    cacheTime: Infinity,
    onError: (error) => {
      toast.error(error.message || "Failed to fetch manager profile");
    },
  });
};

// Function to prefetch the profile after login
export const prefetchArtistProfile = async (queryClient: any) => {
  await queryClient.prefetchQuery({
    queryKey: ["my-artist-profile"],
    queryFn: fetchMyArtistProfile,
    retry: false,
  });
};

export const prefetchManagerProfile = async (queryClient: any) => {
  await queryClient.prefetchQuery({
    queryKey: ["my-manager-profile"],
    queryFn: fetchMyManagerProfile,
    retry: false,
  });
};

export const useInvalidateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => Promise.resolve(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-artist-profile"] });
      queryClient.invalidateQueries({ queryKey: ["my-manager-profile"] });
    },
  });
};
