import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { 
  Plus, 
  Upload, 
  X, 
  Image as ImageIcon,
  Wifi,
  Car,
  Utensils,
  ShowerHead,
  Bed,
  Tv,
  Wind,
  Zap
} from "lucide-react";

const addRoomSchema = z.object({
  number: z.string().min(1, "Nomor kamar harus diisi"),
  kosName: z.string().min(1, "Nama kos harus diisi"),
  type: z.string().min(1, "Tipe kamar harus dipilih"),
  price: z.number().min(1, "Harga harus lebih dari 0"),
  size: z.string().min(1, "Ukuran kamar harus diisi"),
  floor: z.number().min(1, "Lantai harus diisi"),
  description: z.string().optional(),
  facilities: z.array(z.string()).min(1, "Pilih minimal 1 fasilitas")
});

type AddRoomForm = z.infer<typeof addRoomSchema>;

const availableFacilities = [
  { id: "wifi", label: "WiFi", icon: Wifi },
  { id: "parkir", label: "Parkir", icon: Car },
  { id: "dapur", label: "Dapur Bersama", icon: Utensils },
  { id: "kamar_mandi_dalam", label: "Kamar Mandi Dalam", icon: ShowerHead },
  { id: "kasur", label: "Kasur", icon: Bed },
  { id: "tv", label: "TV", icon: Tv },
  { id: "ac", label: "AC", icon: Wind },
  { id: "listrik", label: "Listrik", icon: Zap }
];

interface AddRoomModalProps {
  trigger?: React.ReactNode;
}

export function AddRoomModal({ trigger }: AddRoomModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddRoomForm>({
    resolver: zodResolver(addRoomSchema),
    defaultValues: {
      number: "",
      kosName: "",
      type: "",
      price: 0,
      size: "",
      floor: 1,
      description: "",
      facilities: []
    }
  });

  const addRoomMutation = useMutation({
    mutationFn: async (data: AddRoomForm & { images: File[] }) => {
      const formData = new FormData();
      
      // Add room data
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'images') {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Add images
      data.images.forEach((file, index) => {
        formData.append(`images`, file);
      });

      const response = await fetch("/api/rooms", {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        throw new Error("Gagal menambahkan kamar");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Berhasil!",
        description: "Kamar baru berhasil ditambahkan",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      setOpen(false);
      form.reset();
      setSelectedImages([]);
      setPreviewUrls([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan kamar",
        variant: "destructive"
      });
    }
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        toast({
          title: "Format file tidak valid",
          description: "Hanya file gambar yang diperbolehkan",
          variant: "destructive"
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File terlalu besar",
          description: "Ukuran file maksimal 5MB",
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    const totalFiles = selectedImages.length + validFiles.length;
    if (totalFiles > 5) {
      toast({
        title: "Terlalu banyak gambar",
        description: "Maksimal 5 gambar per kamar",
        variant: "destructive"
      });
      return;
    }

    setSelectedImages(prev => [...prev, ...validFiles]);

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrls(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: AddRoomForm) => {
    addRoomMutation.mutate({
      ...data,
      images: selectedImages
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kamar Baru
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-teal-800">
            Tambah Kamar Baru
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Kamar</FormLabel>
                    <FormControl>
                      <Input placeholder="101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kosName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kos</FormLabel>
                    <FormControl>
                      <Input placeholder="Kos Melati" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Kamar</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe kamar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Deluxe">Deluxe</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga (per bulan)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1500000" 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ukuran Kamar</FormLabel>
                    <FormControl>
                      <Input placeholder="3x4 meter" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lantai</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1" 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Deskripsi tambahan tentang kamar..."
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Facilities */}
            <FormField
              control={form.control}
              name="facilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fasilitas</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {availableFacilities.map((facility) => {
                      const IconComponent = facility.icon;
                      return (
                        <div key={facility.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={facility.id}
                            checked={field.value?.includes(facility.label)}
                            onCheckedChange={(checked) => {
                              const updatedFacilities = checked
                                ? [...(field.value || []), facility.label]
                                : field.value?.filter(f => f !== facility.label) || [];
                              field.onChange(updatedFacilities);
                            }}
                          />
                          <Label
                            htmlFor={facility.id}
                            className="flex items-center space-x-2 text-sm cursor-pointer"
                          >
                            <IconComponent className="h-4 w-4 text-teal-600" />
                            <span>{facility.label}</span>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload */}
            <div>
              <Label className="text-sm font-medium">Upload Gambar Kamar (Maksimal 5)</Label>
              <div className="mt-2">
                <div className="border-2 border-dashed border-teal-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-teal-500 mx-auto mb-2" />
                    <p className="text-sm text-teal-600">
                      Klik untuk upload gambar atau drag & drop
                    </p>
                    <p className="text-xs text-teal-500 mt-1">
                      PNG, JPG, JPEG (Max. 5MB per file)
                    </p>
                  </label>
                </div>

                {/* Image Previews */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                    {previewUrls.map((url, index) => (
                      <Card key={index} className="relative group">
                        <CardContent className="p-2">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Facilities Preview */}
            {form.watch("facilities")?.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Fasilitas Terpilih:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.watch("facilities").map((facility, index) => (
                    <Badge key={index} variant="secondary" className="bg-teal-100 text-teal-700">
                      {facility}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={addRoomMutation.isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                disabled={addRoomMutation.isPending}
              >
                {addRoomMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </div>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Kamar
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}