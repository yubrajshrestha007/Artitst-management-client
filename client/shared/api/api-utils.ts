import Cookies from "js-cookie";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "@/types/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined in .env.local");
}

// Define a more flexible type for error responses
type ApiError = {
  [key: string]: any; // Allow any key-value pair
  detail?: string;
  message?: string;
  name?: string[];
  errors?: { [key: string]: string[] };
};

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
      const errorData = await handleApiError(response); // Use the improved error handler
      return errorData as T | null;
    }

    if (response.status === 204) {
      // Handle No Content responses
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    toast.error("An unexpected error occurred.");
    throw error; // Re-throw for higher-level handling
  }
};

export const handleApiError = async (response: Response): Promise<ApiError | null> => {
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
  if (response.status === 403) {
    toast.error("You do not have permission to perform this action.");
    return null;
  }
  if (response.status >= 500) {
    toast.error("An internal server error occurred.");
    return null;
  }

  try {
    const errorData: ApiError = await response.json();

    if (typeof errorData === "object" && errorData !== null) {
      if (errorData.hasOwnProperty("name") && Array.isArray(errorData.name)) {
        toast.error(errorData.name[0]);
      } else if (errorData.hasOwnProperty("detail")) {
        toast.error(errorData.detail);
      } else if (errorData.hasOwnProperty("message")) {
        toast.error(errorData.message);
      } else if (errorData.hasOwnProperty("errors")) {
        // Handle errors object
        const errors = errorData.errors;
        if (typeof errors === "object") {
          for (const key in errors) {
            if (Array.isArray(errors[key])) {
              toast.error(`${key}: ${errors[key].join(", ")}`);
            }
          }
        }
      } else {
        toast.error("An error occurred");
      }
    } else {
      toast.error("An error occurred");
    }
    return errorData; // Return the error data for more detailed handling
  } catch (error) {
    console.error("Error parsing error response:", error);
    toast.error("An unexpected error occurred.");
    throw new Error("An unexpected error occurred.");
  }
};

export const getRoleFromToken = (): string | null => {
  const accessToken = Cookies.get("access");
  if (!accessToken) return null;
  try {
    const decodedToken: DecodedToken = jwtDecode(accessToken);
    return decodedToken.role ?? null;
  } catch (error) {
    console.error("Error decoding token:", error);
    toast.error("Failed to decode token");
    return null;
  }
};

export const getHeaders = () => {
  const accessToken = Cookies.get("access");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
};
