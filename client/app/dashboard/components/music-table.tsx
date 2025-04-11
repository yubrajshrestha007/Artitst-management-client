// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/music-table.tsx
"use client";

import { Music } from "@/types/auth";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import Dropdown components
import { Pencil, Trash2, Eye, MoreHorizontal } from "lucide-react"; // Import MoreHorizontal

// Format date for display in the table
const formatDateForDisplay = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      // hour: '2-digit', minute: '2-digit' // Uncomment if time is needed
    });
  } catch {
    return "Invalid Date";
  }
};

interface MusicTableProps {
  musicList: Music[];
  onEdit: (music: Music) => void;
  onDelete: (music: Music) => void;
  onView?: (music: Music) => void;
  isLoadingEdit: boolean;
  isLoadingDelete: boolean;
}

export const MusicTable = ({
  musicList,
  onEdit,
  onDelete,
  onView,
  isLoadingEdit,
  isLoadingDelete,
}: MusicTableProps) => {
  // Combine loading states for disabling actions
  const isActionLoading = isLoadingEdit || isLoadingDelete;

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Album Name</TableHead>
            <TableHead>Genre</TableHead>
            <TableHead>Release Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {musicList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No music found. Create your first track!
              </TableCell>
            </TableRow>
          ) : (
            musicList.map((music) => (
              <TableRow key={music.id}>
                <TableCell className="font-medium">{music.title}</TableCell>
                <TableCell>{music.album_name}</TableCell>
                <TableCell>{music.genre ? music.genre.charAt(0).toUpperCase() + music.genre.slice(1) : 'N/A'}</TableCell>
                <TableCell>{formatDateForDisplay(music.release_date)}</TableCell>
                <TableCell className="text-right">
                  {/* --- MODIFIED ACTIONS CELL --- */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0" disabled={isActionLoading}>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {/* View Action */}
                      {onView && (
                        <DropdownMenuItem
                          onClick={() => onView(music)}
                          disabled={isActionLoading}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4 text-blue-500" />
                          View Details
                        </DropdownMenuItem>
                      )}

                      {/* Edit Action */}
                      <DropdownMenuItem
                        onClick={() => onEdit(music)}
                        disabled={isActionLoading}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Music
                      </DropdownMenuItem>

                      {/* Delete Action */}
                      <DropdownMenuItem
                        onClick={() => onDelete(music)}
                        disabled={isActionLoading}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Music
                      </DropdownMenuItem>

                    </DropdownMenuContent>
                  </DropdownMenu>
                  {/* --- END MODIFIED ACTIONS CELL --- */}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
