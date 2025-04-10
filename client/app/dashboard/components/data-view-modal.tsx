// /home/mint/Desktop/ArtistMgntFront/client/config/detailViewConfig.ts
import { User, ArtistProfile, ManagerProfile, Music } from "@/types/auth";
import { formatRelativeTime } from "@/lib/utils"; // Assuming this exists
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import React from "react";

// Define a union type for all possible items
export type DetailItem = User | ArtistProfile | ManagerProfile | Music;
export type ItemType = "user" | "artist" | "manager" | "music";

// Helper to safely get nested values (reuse from DataTable or define here)

const formatDate = (value: unknown): React.ReactNode => {
  if (!value) return "N/A";
  try {
    const date = new Date(value as string | number | Date);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return "Invalid Date";
  }
};

// Helper to format boolean status
const formatStatus = (value: unknown): React.ReactNode => {
  return value ? (
    <Badge variant="outline" className="border-green-500 text-green-600">
      <CheckCircle className="mr-1 h-3 w-3" /> Active
    </Badge>
  ) : (
    <Badge variant="secondary">
      <XCircle className="mr-1 h-3 w-3" /> Inactive
    </Badge>
  );
};

// Helper to format relative time
const formatRelative = (value: unknown): React.ReactNode => {
    if (!value) return "N/A";
    const formatted = formatRelativeTime(value as string | Date);
    return formatted || "Invalid Date";
}

// Interface for field definitions
interface DetailField<T extends DetailItem> {
  key: keyof T | string; // Allow string for nested paths like 'user.email'
  label: string;
  formatter?: (value: any, item: T, managerMap?: Map<string, string>) => React.ReactNode;
}

// Configuration Object
export const detailViewConfig: { [key in ItemType]: DetailField<any>[] } = {
  user: [
    { key: "email", label: "Email" },
    { key: "role", label: "Role", formatter: (value) => value ? value.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : 'N/A' },
    { key: "is_active", label: "Status", formatter: formatStatus },
    // Add other user fields if they exist (e.g., created date)
    // { key: "created", label: "Created", formatter: formatRelative },
  ],
  artist: [
    { key: "name", label: "Name" },
    { key: "gender", label: "Gender", formatter: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : 'N/A' },
    { key: "address", label: "Address" },
    { key: "date_of_birth", label: "Date of Birth", formatter: formatDate },
    { key: "first_release_year", label: "First Release Year" },
    { key: "no_of_albums_released", label: "Albums Released", formatter: (value) => value ?? 0 },
    {
      key: "manager_id_id",
      label: "Manager",
      formatter: (value, item, managerMap) => {
        const managerName = value ? managerMap?.get(value as string) : null;
        return managerName ? <Badge variant="outline">{managerName}</Badge> : <Badge variant="secondary">No Manager</Badge>;
      },
    },
    { key: "created", label: "Profile Created", formatter: formatRelative },
  ],
  manager: [
    { key: "name", label: "Name" },
    { key: "gender", label: "Gender", formatter: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : 'N/A' },
    { key: "address", label: "Address" },
    { key: "date_of_birth", label: "Date of Birth", formatter: formatDate },
    { key: "company_name", label: "Company Name" },
    { key: "company_email", label: "Company Email" },
    { key: "company_phone", label: "Company Phone" },
    { key: "created", label: "Profile Created", formatter: formatRelative },
  ],
  music: [
    { key: "title", label: "Title" },
    { key: "album_name", label: "Album Name" },
    { key: "genre", label: "Genre", formatter: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : 'N/A' },
    { key: "release_date", label: "Release Date", formatter: (value) => value ? new Date(value as string).toLocaleString() : 'N/A' },
    { key: "artist_name", label: "Artist Name" }, // Assuming this is on the Music object
    { key: "created", label: "Track Added", formatter: formatRelative },
  ],
};
