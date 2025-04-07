// /home/mint/Desktop/ArtistMgntFront/client/shared/api/users.ts
import { User, UserQueryResponse, DecodedToken } from "@/types/auth";
import { jwtDecode, JwtPayload } from "jwt-decode";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in .env.local");
}

// Helper function for API requests
const apiRequest = async (
  url: string,
  method: string,
  access: string,
  data?: any
): Promise<any> => {
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
      throw new Error(errorData.detail || "API request failed");
    } catch (error) {
      throw new Error("API request failed");
    }
  }

  if (response.status === 204) {
    return null; // Return null for 204 No Content
  }

  return response.json();
};

// Fetch all users
export const fetchUsers = async (access: string): Promise<UserQueryResponse> => {
  const response = await fetch(`${BASE_URL}users/`, {
    headers: {
      Authorization: `Bearer ${access}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const users: User[] = await response.json();

  // Decode the token to get the current user's role
  let currentUserRole = "";
  if (access) {
    const decodedToken: JwtPayload & DecodedToken = jwtDecode(access);
    currentUserRole = decodedToken.role || ""; // Assuming the role is in the 'role' claim
  }

  return { users, currentUserRole };
};

// New function to fetch a single user by ID
export const fetchUser = async (access: string, id: string): Promise<User | null> => {
  try {
    return await apiRequest(`users/${id}/`, "GET", access);
  } catch (error) {
    // Handle 404 or other errors gracefully
    if (error instanceof Error && error.message.includes("404")) {
      return null;
    }
    throw error;
  }
};

export const createUser = async (
  access: string,
  data: Partial<User>
): Promise<User> => {
  return apiRequest("users-create/", "POST", access, data); // Corrected URL
};

export const updateUser = async (
  access: string,
  id: string,
  data: Partial<User>
): Promise<User> => {
  return apiRequest(`users/${id}/`, "PUT", access, data);
};

export const deleteUser = async (access: string, id: string): Promise<void> => {
  await apiRequest(`users/${id}/`, "DELETE", access);
};
