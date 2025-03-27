// /home/mint/Desktop/ArtistMgntFront/client/hooks/auth.ts
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { prefetchProfile } from "@/shared/queries/profiles";

import { QueryClient } from "@tanstack/react-query";

export const useAuth = (queryClient: QueryClient) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const access = Cookies.get("access");
    if (access) {
      setIsAuthenticated(true);
      prefetchProfile(queryClient);
    }
  }, [queryClient]);

  return { isAuthenticated, setIsAuthenticated };
};
