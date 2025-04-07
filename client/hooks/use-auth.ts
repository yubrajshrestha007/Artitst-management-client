// /home/mint/Desktop/ArtistMgntFront/client/hooks/auth.ts
import { decodeAccessToken } from "@/lib/jwt-lib";
import { useMemo } from "react";

export const useAuth = () => {
  const decodedToken = useMemo(() => decodeAccessToken(), []);
  const isAuthenticated = !!decodedToken;
  const role = decodedToken?.role || null;
  const name = decodedToken?.name || null;
  const email = decodedToken?.email || null; // Add this line

  return { isAuthenticated, role, name, email };
};
