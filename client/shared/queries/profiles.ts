// /home/mint/Desktop/ArtistMgntFront/client/shared/queries/profile.ts
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ArtistProfile, ManagerProfile } from "@/types/auth";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "@/types/auth";

type Profile = ArtistProfile | ManagerProfile | null;

const fetchMyProfile = async (): Promise<Profile> => {
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

  const url = `${process.env.NEXT_PUBLIC_API_URL}${
    role === "artist" ? `artists/by-user/${userId}/` : `manager-by-user/${userId}/`
  }`;

  const response = await fetch(url, { // Use the constructed URL
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

export const useMyProfileQuery = (isAuthenticated: boolean) => {
  return useQuery<Profile, Error>({
    queryKey: ["my-profile"],
    queryFn: fetchMyProfile,
    enabled: isAuthenticated, // Only fetch if logged in
    staleTime: Infinity, // Data is always fresh
    cacheTime: Infinity,
  });
};

// Function to prefetch the profile after login
export const prefetchProfile = async (queryClient: any) => {
    await queryClient.prefetchQuery({
        queryKey: ["my-profile"],
        queryFn: fetchMyProfile,
    });
};

export const useInvalidateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => Promise.resolve(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-profile"] });
        },
    });
};
