// /home/mint/Desktop/ArtistMgntFront/client/lib/jwt-utils.ts
import {jwtDecode} from "jwt-decode";
import Cookies from "js-cookie";

interface DecodedToken {
  email: string;
  exp: number;
  iat: number;
  user_id: number;
}

export const decodeAccessToken = (): DecodedToken | null => {
  const accessToken = Cookies.get("access");

  if (!accessToken) {
    return null;
  }

  try {
    const decodedToken = jwtDecode<DecodedToken>(accessToken);
    return decodedToken;
  } catch (error) {
    console.error("Error decoding access token:", error);
    return null;
  }
};
