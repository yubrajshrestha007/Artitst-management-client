// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/music-list.tsx
import {
  useCreateMusicMutation,
  useDeleteMusicMutation,
  useMusicListQuery,
  useUpdateMusicMutation,
} from "@/shared/queries/music";
import { Music } from "@/types/auth";
import { useState } from "react";
import { useMyArtistProfileQuery } from "@/shared/queries/profiles";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { CustomModal } from "@/components/ui/custom-modal";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const MusicList = () => {
  const { data: musicList, isLoading } = useMusicListQuery();
  const {
    mutate: createMusic,
    isLoading: isCreating,
  } = useCreateMusicMutation({
    onSuccess: () => {
      toast.success("Music created successfully!");
      setIsModalOpen(false);
      setFormData({
        title: "",
        album_name: "",
        genre: "",
        release_date: null,
        created_by_id: "",
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create music");
    },
  });
  const {
    mutate: updateMusic,
    isLoading: isUpdating,
  } = useUpdateMusicMutation({
    onSuccess: () => {
      toast.success("Music updated successfully!");
      setIsModalOpen(false);
      setFormData({
        title: "",
        album_name: "",
        genre: "",
        release_date: null,
        created_by_id: "",
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update music");
    },
  });
  const {
    mutate: deleteMusic,
    isLoading: isDeleting,
  } = useDeleteMusicMutation({
    onSuccess: () => {
      toast.success("Music deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete music");
    },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [musicToDelete, setMusicToDelete] = useState<Music | null>(null);
  const [isCreatingMusic, setIsCreatingMusic] = useState(false);
  const [isUpdatingMusic, setIsUpdatingMusic] = useState(false);
  const [formData, setFormData] = useState<Music>({
    title: "",
    album_name: "",
    genre: "",
    release_date: null,
    created_by_id: "",
  });
  const { data: profile, isLoading: isProfileLoading } =
    useMyArtistProfileQuery(true);

  const handleCreateMusic = () => {
    if (profile) {
      createMusic({ ...formData, created_by_id: profile.user_id });
    }
  };
  const handleUpdateMusic = () => {
    if (selectedMusic?.id) {
      updateMusic({ id: selectedMusic.id, data: formData });
    }
  };
  const handleDeleteMusic = (music: Music) => {
    setMusicToDelete(music);
    setIsDeleteDialogOpen(true);
  };
  const confirmDeleteMusic = () => {
    if (musicToDelete) {
      deleteMusic(musicToDelete.id || "");
      setIsDeleteDialogOpen(false);
      setMusicToDelete(null);
    }
  };

  const cancelDeleteMusic = () => {
    setIsDeleteDialogOpen(false);
    setMusicToDelete(null);
  };
  const handleOpenModal = (music: Music | null = null) => {
    setSelectedMusic(music);
    if (music) {
      setIsUpdatingMusic(true);
      setIsCreatingMusic(false);
      setFormData({
        title: music.title,
        album_name: music.album_name,
        genre: music.genre,
        release_date: music.release_date,
        created_by_id: music.created_by_id,
      });
    } else {
      setIsCreatingMusic(true);
      setIsUpdatingMusic(false);
      setFormData({
        title: "",
        album_name: "",
        genre: "",
        release_date: null,
        created_by_id: "",
      });
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      title: "",
      album_name: "",
      genre: "",
      release_date: null,
      created_by_id: "",
    });
  };
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  if (isLoading || isProfileLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Music List</h2>
        <Button onClick={() => handleOpenModal()}>Create Music</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>S.N.</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Album Name</TableHead>
            <TableHead>Genre</TableHead>
            <TableHead>Release Date</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {musicList?.map((music, index) => (
            <TableRow key={music.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{music.title}</TableCell>
              <TableCell>{music.album_name}</TableCell>
              <TableCell>{music.genre}</TableCell>
              <TableCell>{music.release_date}</TableCell>
              <TableCell>{music.created_by_id}</TableCell>
              <TableCell className="text-right">
                {/* Container for buttons */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenModal(music)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteMusic(music)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isModalOpen && (
        <div
          key={selectedMusic?.id || "new"}
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {isUpdatingMusic ? "Update Music" : "Create Music"}
              </h3>
              <div className="mt-2 px-7 py-3">
                <label htmlFor="title">Title</label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
                <label htmlFor="album_name">Album Name</label>
                <Input
                  type="text"
                  id="album_name"
                  name="album_name"
                  value={formData.album_name}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
                <label htmlFor="genre">Genre</label>
                <Input
                  type="text"
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
                <label htmlFor="release_date">Release Date</label>
                <Input
                  type="datetime-local"
                  id="release_date"
                  name="release_date"
                  value={formData.release_date || ""}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
              <div className="items-center px-4 py-3">
                <Button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                >
                  Cancel
                </Button>
                <Button
                  onClick={isUpdatingMusic ? handleUpdateMusic : handleCreateMusic}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md ml-2"
                  disabled={isCreating || isUpdating}
                >
                  {isUpdatingMusic ? (isUpdating ? "Updating..." : "Update") : (isCreating ? "Creating..." : "Create")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <CustomModal
        isOpen={isDeleteDialogOpen}
        onClose={cancelDeleteMusic}
        onConfirm={confirmDeleteMusic}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete the music."
      />
    </div>
  );
};

export default MusicList;
