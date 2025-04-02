// /home/mint/Desktop/ArtistMgntFront/client/hooks/auth.ts
import { useState, useEffect, useMemo } from "react";
import Cookies from "js-cookie";
import { decodeAccessToken } from "@/lib/jwt-lib";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const decodedToken = useMemo(() => decodeAccessToken(), []);

  useEffect(() => {
    const access = Cookies.get("access");
    const userRole = Cookies.get("role");

    if (access && userRole) {
      setIsAuthenticated(true);
      setRole(userRole);
    } else {
      setIsAuthenticated(false);
      setRole(null);
    }
  }, [decodedToken]);

  return { isAuthenticated, setIsAuthenticated, role };
};
