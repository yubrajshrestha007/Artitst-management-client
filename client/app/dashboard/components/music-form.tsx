// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/music-form.tsx
"use client";

import { Music } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// Define Genre Choices (can be moved to a constants file)
const GENRE_CHOICES = ["rnb", "country", "classic", "rock", "jazz", "pop"] as const;

// Helper to format date for input type="datetime-local"
const formatDateTimeForInput = (date: string | Date | null | undefined): string => {
  if (!date) return "";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    console.error("Error formatting date:", e);
    return "";
  }
};

interface MusicFormProps {
  formData: Partial<Music>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleCloseModal: () => void;
  isSubmitting: boolean;
  isUpdating: boolean;
}

export const MusicForm = ({
  formData,
  handleChange,
  handleSelectChange,
  handleSubmit,
  handleCloseModal,
  isSubmitting,
  isUpdating,
}: MusicFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          type="text"
          id="title"
          name="title"
          value={formData.title || ""}
          onChange={handleChange}
          placeholder="Track Title"
          required
          disabled={isSubmitting}
        />
      </div>
      {/* Album Name */}
      <div className="space-y-2">
        <Label htmlFor="album_name">Album Name</Label>
        <Input
          type="text"
          id="album_name"
          name="album_name"
          value={formData.album_name || ""}
          onChange={handleChange}
          placeholder="Album Name"
          required
          disabled={isSubmitting}
        />
      </div>
      {/* Genre - Select */}
      <div className="space-y-2">
        <Label htmlFor="genre">Genre</Label>
        <Select
          name="genre"
          value={formData.genre || ""}
          // Use the specific handler for Select
          onValueChange={(value) => handleSelectChange("genre", value)}
          required
          disabled={isSubmitting}
        >
          <SelectTrigger id="genre">
            <SelectValue placeholder="Select Genre" />
          </SelectTrigger>
          <SelectContent>
            {GENRE_CHOICES.map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Release Date */}
      <div className="space-y-2">
        <Label htmlFor="release_date">Release Date</Label>
        <Input
          type="datetime-local"
          id="release_date"
          name="release_date"
          value={formatDateTimeForInput(formData.release_date)}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </div>
      {/* Footer */}
      <DialogFooter className="pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCloseModal}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isUpdating ? "Update Music" : "Create Music"}
        </Button>
      </DialogFooter>
    </form>
  );
};
