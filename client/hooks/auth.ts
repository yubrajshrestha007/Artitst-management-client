// /home/mint/Desktop/ArtistMgntFront/client/hooks/auth.ts
"use client"; // Add this line to mark it as a Client Component

import { decodeAccessToken } from "@/lib/jwt-lib";
import { useMemo, useEffect, useState } from "react";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const decodedToken = useMemo(() => decodeAccessToken(), []);

  useEffect(() => {
    if (decodedToken) {
      setIsAuthenticated(true);
      setRole(decodedToken.role || null);
      setName(decodedToken.name || null);
      setEmail(decodedToken.email || null);
    } else {
      setIsAuthenticated(false);
      setRole(null);
      setName(null);
      setEmail(null);
    }
  }, [decodedToken]);

  return { isAuthenticated, role, name, email };
};
