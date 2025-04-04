import Cookies from "js-cookie";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { DecodedToken, ApiError } from "@/types/auth"; // Assuming ApiError is defined here

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined in .env.local");
}

export const apiRequest = async <T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: any
): Promise<T | null> => {
  const accessToken = Cookies.get("access");
  const headers = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      return handleApiError(response); // Use the improved error handler
    }

    if (response.status === 204) { //Handle No Content responses
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    toast.error("An unexpected error occurred.");
    throw error; // Re-throw for higher-level handling
  }
};


export const handleApiError = async (response: Response): Promise<null | ApiError> => {
  if (response.status === 404) {
    return null;
  }
  if (response.status === 401) {
    // Handle unauthorized -  redirect to login or clear token
    Cookies.remove("access");
    toast.error("Your session has expired. Please log in again.");
    // Add your redirect logic here, e.g., using Router.push('/login') if you're using Next.js
    return null;
  }

  try {
    const errorData: ApiError = await response.json();
    const errorMessage = errorData.detail || errorData.message || "An error occurred";
    toast.error(errorMessage);
    return errorData; // Return the error data for more detailed handling
  } catch (error) {
    console.error("Error parsing error response:", error);
    toast.error("An unexpected error occurred.");
    throw new Error("An unexpected error occurred.");
  }
};

export const getHeaders = () => {
  const accessToken = Cookies.get("access");
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
};

export const getRoleFromToken = (): string | null => {
  const accessToken = Cookies.get("access");
  if (!accessToken) return null;
  try {
    const decodedToken: DecodedToken = jwtDecode(accessToken);
    return decodedToken.role ?? null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
