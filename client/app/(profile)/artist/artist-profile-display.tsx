// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/artist-profile-display.tsx
"use client";

import { ArtistProfile } from "@/types/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ArtistProfileDisplayProps {
  profile: ArtistProfile;
  managerName?: string | null; // Optional manager name
}

// Helper to format date nicely
const formatDate = (dateString: string | Date | null | undefined) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch {
    return "Invalid Date";
  }
};

export const ArtistProfileDisplay = ({ profile, managerName }: ArtistProfileDisplayProps) => {
  return (
    <Card className="w-full max-w-2xl"> {/* Limit width */}
      <CardHeader>
        <CardTitle className="text-xl">{profile.name || "Unnamed Artist"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Gender:</span>
          <span>{profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Date of Birth:</span>
          <span>{formatDate(profile.date_of_birth)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Address:</span>
          <span>{profile.address || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-600">First Release Year:</span>
          <span>{profile.first_release_year || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Albums Released:</span>
          <span>{profile.no_of_albums_released ?? 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-600">Manager:</span>
          {managerName ? (
            <Badge variant="outline">{managerName}</Badge>
          ) : (
            <Badge variant="secondary">No Manager</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
