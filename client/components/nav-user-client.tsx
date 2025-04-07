// nav-user-client.tsx
"use client";

import { useAuth } from "@/hooks/auth";
import { NavUser } from "./nav-user";

export function NavUserClient({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { role } = useAuth();

  return <NavUser user={user} role={role} />;
}
