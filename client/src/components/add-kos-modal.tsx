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
  MapPin,
  Wifi,
  Car,
  Utensils,
  ShowerHead,
  Shield,
  Tv,
  Wind,
  Zap
} from "lucide-react";

const addKosSchema = z.object({
  name: z.string().min(1, "Nama kos harus diisi"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  address: z.string().min(10, "Alamat lengkap harus diisi minimal 10 karakter"),
  city: z.string().min(1, "Kota harus diisi"),
  pricePerMonth: z.number().min(100000, "Harga minimal Rp 100.000"),
  type: z.string().min(1, "Tipe kos harus dipilih"),
  totalRooms: z.number().min(1, "Jumlah kamar minimal 1"),
  availableRooms: z.number().min(0, "Kamar tersedia tidak boleh negatif"),
  facilities: z.array(z.string()).min(1, "Pilih minimal 1 fasilitas"),
  ownerName: z.string().min(1, "Nama pemilik harus diisi"),
  ownerPhone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  roomSize: z.string().min(1, "Ukuran kamar harus diisi"),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

type AddKosForm = z.infer<typeof addKosSchema>;

const availableFacilities = [
  { id: "wifi", label: "WiFi", icon: Wifi },
  { id: "parkir", label: "Parkir", icon: Car },
  { id: "dapur", label: "Dapur Bersama", icon: Utensils },
  { id: "kamar_mandi_dalam", label: "Kamar Mandi Dalam", icon: ShowerHead },
  { id: "keamanan", label: "Keamanan 24/7", icon: Shield },
  { id: "tv", label: "TV", icon: Tv },
  { id: "ac", label: "AC", icon: Wind },
  { id: "listrik", label: "Listrik", icon: Zap }
];

interface AddKosModalProps {
  trigger?: React.ReactNode;
}

export function AddKosModal({ trigger }: AddKosModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddKosForm>({
    resolver: zodResolver(addKosSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      city: "",
      pricePerMonth: 0,
      type: "",
      totalRooms: 1,
      availableRooms: 1,
      facilities: [],
      ownerName: "",
      ownerPhone: "",
      roomSize: "",
      latitude: undefined,
      longitude: undefined
    }
  });

  const addKosMutation = useMutation({
    mutationFn: async (data: AddKosForm & { images: File[] }) => {
      const formData = new FormData();
      
      // Add kos data
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

      const response = await fetch("/api/kos", {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        throw new Error("Gagal menambahkan kos");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Berhasil!",
        description: "Kos baru berhasil ditambahkan",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/kos"] });
      setOpen(false);
      form.reset();
      setSelectedImages([]);
      setPreviewUrls([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan kos",
        variant: "destructive"
      });
    }
  });

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "GPS tidak tersedia",
        description: "Browser Anda tidak mendukung geolokasi",
        variant: "destructive"
      });
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        form.setValue("latitude", latitude);
        form.setValue("longitude", longitude);
        
        toast({
          title: "Lokasi berhasil dideteksi",
          description: `Koordinat: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        });
        setIsGettingLocation(false);
      },
      (error) => {
        let message = "Gagal mendapatkan lokasi";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Izin akses lokasi ditolak. Silakan aktifkan GPS dan izinkan akses lokasi.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Informasi lokasi tidak tersedia";
            break;
          case error.TIMEOUT:
            message = "Timeout mendapatkan lokasi";
            break;
        }
        
        toast({
          title: "Error GPS",
          description: message,
          variant: "destructive"
        });
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

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
        description: "Maksimal 5 gambar per kos",
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

  const onSubmit = (data: AddKosForm) => {
    if (!data.latitude || !data.longitude) {
      toast({
        title: "Lokasi GPS diperlukan",
        description: "Silakan klik tombol 'Dapatkan Lokasi GPS' untuk menentukan koordinat kos",
        variant: "destructive"
      });
      return;
    }

    addKosMutation.mutate({
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
            Tambah Kos Baru
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-teal-800">
            Tambah Kos Baru
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Pastikan mengisi alamat lengkap dan koordinat GPS agar mudah ditemukan pencari kos
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kos *</FormLabel>
                    <FormControl>
                      <Input placeholder="Kos Melati Putih" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kota *</FormLabel>
                    <FormControl>
                      <Input placeholder="Jakarta" {...field} />
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
                    <FormLabel>Tipe Kos *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe kos" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="putra">Putra</SelectItem>
                        <SelectItem value="putri">Putri</SelectItem>
                        <SelectItem value="campur">Campur</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricePerMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga per Bulan (Rp) *</FormLabel>
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
                name="totalRooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Kamar *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="20" 
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
                name="availableRooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kamar Tersedia *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="5" 
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
                name="roomSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ukuran Kamar *</FormLabel>
                    <FormControl>
                      <Input placeholder="3x4 meter" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Pemilik *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ibu Sari" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor WhatsApp *</FormLabel>
                    <FormControl>
                      <Input placeholder="+62 812 3456 7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address & Location */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Lengkap *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Jl. Margonda Raya No. 123, RT 01/RW 02, Kel. Kemiri Muka, Kec. Beji, Depok, Jawa Barat 16424"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label className="text-sm font-medium text-blue-800">Koordinat GPS *</Label>
                    <p className="text-xs text-blue-600 mt-1">
                      Diperlukan agar pencari kos dapat menemukan lokasi dengan mudah
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {isGettingLocation ? "Mendapatkan..." : "Dapatkan Lokasi GPS"}
                  </Button>
                </div>
                
                {form.watch("latitude") && form.watch("longitude") && (
                  <div className="text-sm text-green-700 bg-green-100 p-2 rounded">
                    ✓ Lokasi GPS: {form.watch("latitude")?.toFixed(6)}, {form.watch("longitude")?.toFixed(6)}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi Kos *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Kos modern dengan fasilitas lengkap dekat kampus. Kamar nyaman dengan AC, WiFi, dan akses mudah ke transportasi umum..."
                      rows={4}
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
                  <FormLabel>Fasilitas *</FormLabel>
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
              <Label className="text-sm font-medium">Upload Foto Kos (Maksimal 5) *</Label>
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
                      Klik untuk upload foto atau drag & drop
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
                disabled={addKosMutation.isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                disabled={addKosMutation.isPending}
              >
                {addKosMutation.isPending ? "Menyimpan..." : "Simpan Kos"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}