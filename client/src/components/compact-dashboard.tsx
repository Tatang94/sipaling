import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Building2, 
  Users, 
  CreditCard, 
  Menu, 
  LogOut, 
  Plus,
  Eye,
  Phone,
  Calendar,
  MapPin,
  Upload,
  X,
  Image as ImageIcon
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function CompactDashboard() {
  const [, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Form state for adding new room
  const [newRoom, setNewRoom] = useState({
    number: "",
    kosName: "",
    type: "",
    price: "",
    facilities: "",
    description: "",
    size: "",
    floor: "1"
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    setLocation("/login");
  };

  const loadRooms = () => {
    const savedRooms = JSON.parse(localStorage.getItem("ownerRooms") || "[]");
    setRooms(savedRooms);
  };

  useEffect(() => {
    loadRooms();
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRoom.number || !newRoom.kosName || !newRoom.type || !newRoom.price) {
      toast({
        title: "Form tidak lengkap",
        description: "Mohon isi semua field yang wajib",
        variant: "destructive"
      });
      return;
    }

    const roomData = {
      id: Date.now(),
      ...newRoom,
      price: parseInt(newRoom.price),
      floor: parseInt(newRoom.floor),
      facilities: newRoom.facilities.split(',').map(f => f.trim()).filter(f => f),
      isOccupied: false,
      images: previewUrls, // Store base64 images for demo
      ownerId: currentUser.id,
      createdAt: new Date().toISOString()
    };

    const existingRooms = JSON.parse(localStorage.getItem("ownerRooms") || "[]");
    const updatedRooms = [...existingRooms, roomData];
    localStorage.setItem("ownerRooms", JSON.stringify(updatedRooms));
    
    setRooms(updatedRooms);
    setIsAddRoomOpen(false);
    
    // Reset form
    setNewRoom({
      number: "",
      kosName: "",
      type: "",
      price: "",
      facilities: "",
      description: "",
      size: "",
      floor: "1"
    });
    setSelectedImages([]);
    setPreviewUrls([]);

    toast({
      title: "Berhasil!",
      description: "Kamar baru berhasil ditambahkan",
    });
  };

  // Compact stats
  const stats = {
    totalRooms: rooms.length,
    occupiedRooms: rooms.filter(r => r.isOccupied).length,
    availableRooms: rooms.filter(r => !r.isOccupied).length,
    monthlyRevenue: rooms.reduce((total, room) => total + (room.isOccupied ? room.price : 0), 0)
  };

  const Navigation = ({ isMobile = false }) => (
    <nav className={`${isMobile ? "space-y-2" : "flex space-x-3"}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLocation("/profile")}
        className={`${isMobile ? "w-full justify-start" : ""} text-gray-600 hover:text-primary`}
      >
        <User className="w-4 h-4 mr-2" />
        Profil
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className={`${isMobile ? "w-full justify-start" : ""} text-gray-600 hover:text-red-600`}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Keluar
      </Button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Mobile Header */}
      <div className="bg-white shadow-sm border-b px-3 py-2 md:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold">Dashboard Admin</h1>
            <p className="text-xs text-gray-600">{currentUser.name}</p>
          </div>
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="py-4">
                <Navigation isMobile={true} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Compact Desktop Header */}
      <div className="hidden md:block bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Dashboard Pemilik Kos</h1>
            <p className="text-sm text-gray-600">Kelola kos Anda dengan mudah</p>
          </div>
          <Navigation />
        </div>
      </div>

      <div className="p-3 md:p-4">
        {/* Compact Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-3">
              <div className="text-center">
                <Building2 className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-blue-800">{stats.totalRooms}</p>
                <p className="text-xs text-blue-600">Total Kamar</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-3">
              <div className="text-center">
                <Users className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-green-800">{stats.occupiedRooms}</p>
                <p className="text-xs text-green-600">Kamar Terisi</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-3">
              <div className="text-center">
                <Building2 className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-orange-800">{stats.availableRooms}</p>
                <p className="text-xs text-orange-600">Kamar Kosong</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-3">
              <div className="text-center">
                <CreditCard className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <p className="text-sm font-bold text-purple-800">{formatPrice(stats.monthlyRevenue)}</p>
                <p className="text-xs text-purple-600">Pendapatan</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Room Management Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Manajemen Kamar</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {stats.occupiedRooms} terisi, {stats.availableRooms} kosong
                </p>
              </div>
              <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah Kamar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Tambah Kamar Baru</DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="number">Nomor Kamar *</Label>
                        <Input
                          id="number"
                          value={newRoom.number}
                          onChange={(e) => setNewRoom({...newRoom, number: e.target.value})}
                          placeholder="A-101"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="kosName">Nama Kos *</Label>
                        <Input
                          id="kosName"
                          value={newRoom.kosName}
                          onChange={(e) => setNewRoom({...newRoom, kosName: e.target.value})}
                          placeholder="Kos Melati"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="type">Tipe Kamar *</Label>
                        <Select onValueChange={(value) => setNewRoom({...newRoom, type: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe kamar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Standard">Standard</SelectItem>
                            <SelectItem value="Deluxe">Deluxe</SelectItem>
                            <SelectItem value="Premium">Premium</SelectItem>
                            <SelectItem value="VIP">VIP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="price">Harga per Bulan *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newRoom.price}
                          onChange={(e) => setNewRoom({...newRoom, price: e.target.value})}
                          placeholder="2500000"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="size">Ukuran Kamar</Label>
                        <Input
                          id="size"
                          value={newRoom.size}
                          onChange={(e) => setNewRoom({...newRoom, size: e.target.value})}
                          placeholder="3x4 meter"
                        />
                      </div>

                      <div>
                        <Label htmlFor="floor">Lantai</Label>
                        <Input
                          id="floor"
                          type="number"
                          value={newRoom.floor}
                          onChange={(e) => setNewRoom({...newRoom, floor: e.target.value})}
                          placeholder="1"
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="facilities">Fasilitas (pisahkan dengan koma)</Label>
                      <Input
                        id="facilities"
                        value={newRoom.facilities}
                        onChange={(e) => setNewRoom({...newRoom, facilities: e.target.value})}
                        placeholder="WiFi, AC, Kamar Mandi Dalam, Kasur"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Deskripsi</Label>
                      <Textarea
                        id="description"
                        value={newRoom.description}
                        onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                        placeholder="Deskripsi tambahan tentang kamar..."
                        rows={3}
                      />
                    </div>

                    {/* Image Upload Section */}
                    <div>
                      <Label>Upload Gambar Kamar (Maksimal 5)</Label>
                      <div className="mt-2">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                          />
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              Klik untuk upload gambar atau drag & drop
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG, JPEG (Max. 5MB per file)
                            </p>
                          </label>
                        </div>

                        {/* Image Previews */}
                        {previewUrls.length > 0 && (
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-3">
                            {previewUrls.map((url, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={url}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-16 object-cover rounded border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddRoomOpen(false)}
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Tambah Kamar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {rooms.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-700 mb-2">Belum Ada Kamar</h3>
                <p className="text-sm text-gray-600 mb-4">Tambahkan kamar pertama untuk mulai mengelola kos Anda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {rooms.map((room) => (
                  <Card key={room.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-sm">Kamar {room.number}</h3>
                          <p className="text-xs text-gray-600">{room.kosName}</p>
                        </div>
                        <Badge 
                          variant={room.isOccupied ? "destructive" : "default"}
                          className={`text-xs ${room.isOccupied ? 
                            "bg-red-100 text-red-700" : 
                            "bg-green-100 text-green-700"
                          }`}
                        >
                          {room.isOccupied ? "Terisi" : "Kosong"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <p><span className="font-medium">Tipe:</span> {room.type}</p>
                        <p><span className="font-medium">Harga:</span> {formatPrice(room.price)}/bulan</p>
                        {room.size && <p><span className="font-medium">Ukuran:</span> {room.size}</p>}
                        <p><span className="font-medium">Lantai:</span> {room.floor}</p>
                      </div>

                      {room.facilities && room.facilities.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">Fasilitas:</p>
                          <div className="flex flex-wrap gap-1">
                            {room.facilities.slice(0, 3).map((facility: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                                {facility}
                              </Badge>
                            ))}
                            {room.facilities.length > 3 && (
                              <Badge variant="secondary" className="text-xs px-1 py-0">
                                +{room.facilities.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {room.images && room.images.length > 0 && (
                        <div className="mt-2">
                          <div className="flex space-x-1">
                            {room.images.slice(0, 3).map((image: string, index: number) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Room ${room.number} - ${index + 1}`}
                                className="w-8 h-8 object-cover rounded border"
                              />
                            ))}
                            {room.images.length > 3 && (
                              <div className="w-8 h-8 bg-gray-100 rounded border flex items-center justify-center">
                                <span className="text-xs text-gray-600">+{room.images.length - 3}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {room.tenantName && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <p><span className="font-medium">Penyewa:</span> {room.tenantName}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}