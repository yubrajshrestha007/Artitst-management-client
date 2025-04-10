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
// Import Eye icon
import { Pencil, Trash2, Eye } from "lucide-react";

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
  onView?: (music: Music) => void; // <<< ADDED: Optional handler for viewing details
  isLoadingEdit: boolean;
  isLoadingDelete: boolean;
}

export const MusicTable = ({
  musicList,
  onEdit,
  onDelete,
  onView, // <<< ADDED: Destructure onView
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
                  <div className="flex justify-end gap-1">
                    {/* <<< ADDED: View Button >>> */}
                    {onView && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(music)} // Call onView handler
                        title="View Music Details"
                        disabled={isActionLoading} // Disable during other actions
                      >
                        <Eye className="h-4 w-4 text-blue-500" />
                      </Button>
                    )}
                    {/* --- Edit Button --- */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(music)}
                      title="Edit Music"
                      disabled={isActionLoading} // Use combined loading state
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {/* --- Delete Button --- */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(music)}
                      title="Delete Music"
                      disabled={isActionLoading} // Use combined loading state
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
