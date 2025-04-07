// artist-profile-page-client.tsx
"use client";

import { useAuth } from "@/hooks/auth";
import ArtistProfilePage from "./artist-server"; // Import the server component

export default function ArtistProfilePageClient() {
  const { isAuthenticated, role } = useAuth();

  return (
    <ArtistProfilePage isAuthenticated={isAuthenticated} role={role} />
  );
}
