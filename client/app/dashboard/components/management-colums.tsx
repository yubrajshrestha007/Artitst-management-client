// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/management-columns.tsx
import React from 'react'; // Import React for JSX
import { User, ArtistProfile } from "@/types/auth";
import { ColumnDefinition } from "./data-table";
import { ManagerProfileWithDetails } from "@/hooks/use-management"; // Adjust path if needed
import { Badge } from "@/components/ui/badge"; // Import Badge component

export const userColumns: ColumnDefinition<User>[] = [
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "is_active", label: "Status" },
];

export const artistColumns: ColumnDefinition<ArtistProfile>[] = [
  { key: "name", label: "Name" },
  { key: "gender", label: "Gender" },
  { key: "address", label: "Address" },
  { key: "date_of_birth", label: "Date of Birth" },
  { key: "first_release_year", label: "First Release Year" },
  { key: "manager_id_id", label: "Manager Name" }, // Rendered via map in DataTable
  { key: "no_of_albums_released", label: "Albums Released" },
];

export const managerColumns: ColumnDefinition<ManagerProfileWithDetails>[] = [
  { key: "name", label: "Name" },
  // --- Updated Column for Artist Names ---
  {
    key: "managedArtistNames", // Use the new key
    label: "Managed Artists",
    // Custom render function to display names
    render: (item) => { // item is ManagerProfileWithDetails here
      const names = item.managedArtistNames; // Access the names array
      if (!names || names.length === 0) {
        // JSX is now allowed
        return <span className="text-xs text-muted-foreground">None</span>;
      }
      // Display names using Badges
      return (
        // JSX is now allowed
        <div className="flex flex-wrap gap-1">
          {names.map((name, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {name}
            </Badge>
          ))}
        </div>
      );
    },
  },
  // --- End Updated Column ---
  { key: "gender", label: "Gender" },
  { key: "address", label: "Address" },
  { key: "date_of_birth", label: "Date of Birth" },
  { key: "company_name", label: "Company Name" },
  { key: "company_email", label: "Company Email" },
  { key: "company_phone", label: "Company Phone" },
];


type ManagementType = "user" | "artist" | "manager" | undefined;

// Adjust return type annotation if necessary
export const getManagementConfig = (type: ManagementType): {
    columns: ColumnDefinition<User | ArtistProfile | ManagerProfileWithDetails>[];
    title: string;
    createLabel: string;
} => {
  switch (type) {
    case "user":
      return { columns: userColumns as ColumnDefinition<User | ArtistProfile | ManagerProfileWithDetails>[], title: "User List", createLabel: "Create User" };
    case "artist":
      return { columns: artistColumns as ColumnDefinition<User | ArtistProfile | ManagerProfileWithDetails>[], title: "Artist Profiles", createLabel: "Create Artist Profile" };
    case "manager":
      return { columns: managerColumns as ColumnDefinition<User | ArtistProfile | ManagerProfileWithDetails>[], title: "Manager Profiles", createLabel: "Create Manager Profile" };
    default:
      // Ensure default columns match the return type if needed, or adjust type
      return { columns: [] as ColumnDefinition<User | ArtistProfile | ManagerProfileWithDetails>[], title: "Management", createLabel: "Create Item" };
  }
};
