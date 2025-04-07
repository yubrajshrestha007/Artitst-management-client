// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/user-form.tsx
import { User } from "@/types/auth";
import { useEffect } from "react";
import { useUsersQuery } from "@/shared/queries/users";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

// Define a Zod schema for form validation
const userFormSchema = z.object({
  id: z.string().optional(),
  email: z.string().email().optional(),
  is_active: z.boolean(),
  role: z.enum(["artist", "artist_manager"]),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  onSubmit: (data: Partial<User>) => void;
  initialData?: Partial<User>;
}

export default function UserForm({ onSubmit, initialData }: UserFormProps) {
  const { data: usersData } = useUsersQuery();
  const currentUserRole = usersData?.currentUserRole || "";
  const isEditMode = !!initialData;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      is_active: false,
      role: currentUserRole === "artist_manager" ? "artist" : "artist_manager",
      ...initialData,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const handleSubmit = (values: UserFormValues) => {
    const dataToSubmit: Partial<User> = { ...values };

    if (isEditMode) {
      delete dataToSubmit.email;
    }
    onSubmit(dataToSubmit);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        {form.watch("id") && (
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Id</FormLabel>
                <FormControl>
                  <Input type="text" readOnly {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" readOnly {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => field.onChange(value === "true")}
                  defaultValue={field.value.toString()}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">
                      <Badge variant="outline" className="text-green-500">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Active
                      </Badge>
                    </SelectItem>
                    <SelectItem value="false">
                      <Badge variant="outline" className="text-red-500">
                        <XCircle className="mr-2 h-4 w-4" />
                        Inactive
                      </Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="artist">Artist</SelectItem>
                  <SelectItem value="artist_manager">Artist Manager</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
