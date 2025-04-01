// client/lib/roles.ts
export interface RoleOption {
  key: string;
  value: string;
  label: string;
}

export const ROLES: RoleOption[] = [
  {
    key: "artist",
    value: "artist",
    label: "Artist",
  },
  {
    key: "artist_manager",
    value: "artist_manager",
    label: "Artist Manager",
  },
];
