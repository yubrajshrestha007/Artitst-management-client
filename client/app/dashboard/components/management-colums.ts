// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/management-columns.ts
import { User, ArtistProfile, ManagerProfile } from "@/types/auth";
import { ColumnDefinition } from "./data-table"; // Assuming DataTable exports this

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

export const managerColumns: ColumnDefinition<ManagerProfile>[] = [
  { key: "name", label: "Name" },
  { key: "gender", label: "Gender" },
  { key: "address", label: "Address" },
  { key: "date_of_birth", label: "Date of Birth" },
  { key: "company_name", label: "Company Name" },
  { key: "company_email", label: "Company Email" },
  { key: "company_phone", label: "Company Phone" },
];

type ManagementType = "user" | "artist" | "manager" | undefined;

export const getManagementConfig = (type: ManagementType) => {
  switch (type) {
    case "user":
      return { columns: userColumns, title: "User List", createLabel: "Create User" };
    case "artist":
      return { columns: artistColumns, title: "Artist Profiles", createLabel: "Create Artist Profile" };
    case "manager":
      return { columns: managerColumns, title: "Manager Profiles", createLabel: "Create Manager Profile" };
    default:
      return { columns: [], title: "Management", createLabel: "Create Item" };
  }
};
