// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/dashboard-card-item.tsx
"use client";

import { cn, formatRelativeTime } from "@/lib/utils"; // Import helpers
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardCardItemProps {
  title: string;
  count: number;
  subtitle: string;
  latestDate?: Date | null;
  Icon: LucideIcon;
  color?: "blue" | "green" | "yellow" | "purple" | "red" | "gray";
}

export const DashboardCardItem = ({
  title,
  count,
  subtitle,
  latestDate,
  Icon,
  color = "gray",
}: DashboardCardItemProps) => {

  const colorVariants = {
    blue: { icon: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    green: { icon: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
    yellow: { icon: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
    purple: { icon: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
    red: { icon: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
    gray: { icon: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" },
  };

  const classes = colorVariants[color];
  const latestTime = formatRelativeTime(latestDate);

  return (
    <Card className={cn("shadow-sm hover:shadow-md transition-shadow", classes.bg, classes.border)}>
      {/* Further reduced header padding */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-0.5"> {/* Adjusted padding */}
        {/* Smaller title */}
        <CardTitle className="text-xs font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4 text-muted-foreground", classes.icon)} />
      </CardHeader>
      {/* Further reduced content padding */}
      <CardContent className="p-2 pt-0"> {/* Adjusted padding */}
        {/* Smaller count */}
        <div className="text-xl font-bold">{count}</div> {/* Changed from text-2xl */}
        {/* Subtitle and time remain small */}
        <p className="text-xs text-muted-foreground pt-0.5">{subtitle}</p>
        {latestTime && (
          <p className="text-xs text-muted-foreground/80 pt-0.5">
            Last created {latestTime}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
