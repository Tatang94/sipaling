import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Home, 
  Building2, 
  Users, 
  CreditCard, 
  Menu, 
  LogOut, 
  Plus,
  Eye,
  Phone,
  Calendar,
  MapPin
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Get user bookings from localStorage for pencari kos
  const userBookings = JSON.parse(localStorage.getItem("userBookings") || "[]");

  // Form state for adding new room
  const [newRoom, setNewRoom] = useState({
    number: "",
    kosName: "",
    type: "",
    price: "",
    facilities: "",
    description: "",
    size: ""
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userBookings");
    setLocation("/");
  };

  // Handle adding new room
  const handleAddRoom = () => {
    if (!newRoom.number || !newRoom.kosName || !newRoom.price) {
      alert("Mohon lengkapi data kamar");
      return;
    }

    const roomData = {
      id: Date.now(),
      number: newRoom.number,
      kosName: newRoom.kosName,
      type: newRoom.type || "Standard",
      price: parseInt(newRoom.price),
      facilities: newRoom.facilities.split(",").map(f => f.trim()),
      description: newRoom.description,
      size: newRoom.size || "3x4 meter",
      isOccupied: false,
      tenantName: null,
      status: "available"
    };

    // Save to localStorage (in real app would save to database)
    const existingRooms = JSON.parse(localStorage.getItem("ownerRooms") || "[]");
    existingRooms.push(roomData);
    localStorage.setItem("ownerRooms", JSON.stringify(existingRooms));
    setRooms(existingRooms);

    // Reset form
    setNewRoom({
      number: "",
      kosName: "",
      type: "",
      price: "",
      facilities: "",
      description: "",
      size: ""
    });

    setIsAddRoomOpen(false);
    alert("Kamar berhasil ditambahkan!");
  };

  // Load rooms from localStorage
  const loadRooms = () => {
    const savedRooms = JSON.parse(localStorage.getItem("ownerRooms") || "[]");
    setRooms(savedRooms);
  };

  // Load rooms on component mount
  useEffect(() => {
    loadRooms();
  }, []);

  // Simple stats for pemilik kos
  const stats = {
    totalKos: 3,
    totalRooms: 12,
    occupiedRooms: 8,
    monthlyRevenue: 25000000,
  };

  // Mock data for pemilik dashboard
  const mockRooms = [
    {
      id: 1,
      number: "A-101",
      kosName: "Kos Melati",
      isOccupied: true,
      tenantName: "Ahmad Rizki",
      price: 2500000,
      status: "paid"
    },
    {
      id: 2,
      number: "A-102", 
      kosName: "Kos Melati",
      isOccupied: false,
      price: 2500000,
      status: "available"
    },
    {
      id: 3,
      number: "B-201",
      kosName: "Kos Mawar", 
      isOccupied: true,
      tenantName: "Sari Dewi",
      price: 3000000,
      status: "pending"
    }
  ];

  const Navigation = ({ isMobile = false }) => (
    <nav className={`${isMobile ? "space-y-2" : "flex space-x-4"}`}>
      <Button
        variant="ghost"
        onClick={() => setLocation("/")}
        className={`${isMobile ? "w-full justify-start" : ""} text-gray-600 hover:text-primary`}
      >
        <Home className="w-4 h-4 mr-2" />
        Beranda
      </Button>
      <Button
        variant="ghost"
        onClick={handleLogout}
        className={`${isMobile ? "w-full justify-start" : ""} text-gray-600 hover:text-red-600`}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Keluar
      </Button>
    </nav>
  );

  if (currentUser.role === "pencari") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-white shadow-sm border-b px-4 py-3 md:hidden">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Dashboard</h1>
              <p className="text-sm text-gray-600">Halo, {currentUser.name}</p>
            </div>
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="py-6">
                  <Navigation isMobile={true} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard Pencari Kos</h1>
              <p className="text-gray-600">Selamat datang, {currentUser.name}</p>
            </div>
            <Navigation />
          </div>
        </div>

        <div className="p-4 md:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Booking</p>
                    <p className="text-2xl font-bold">{userBookings.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CreditCard className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
                    <p className="text-2xl font-bold">
                      {formatPrice(userBookings.reduce((sum: number, booking: any) => sum + (booking.pricePerMonth || 0), 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bookings List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Riwayat Booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada booking</p>
                  <Button 
                    onClick={() => setLocation("/")}
                    className="mt-4"
                  >
                    Cari Kos Sekarang
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userBookings.map((booking: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{booking.kosName}</h3>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            Booking: {booking.bookingDate}
                          </p>
                          <p className="text-lg font-bold text-primary mt-2">
                            {formatPrice(booking.pricePerMonth)}/bulan
                          </p>
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-4">
                          <Badge className="bg-green-100 text-green-800">
                            Dikonfirmasi
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-2 mt-2 md:mt-0"
                            onClick={() => window.open(`https://wa.me/${booking.ownerPhone}`, '_blank')}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Hubungi
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Dashboard untuk pemilik kos
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Dashboard Admin</h1>
            <p className="text-sm text-gray-600">Halo, {currentUser.name}</p>
          </div>
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="py-6">
                <Navigation isMobile={true} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Pemilik Kos</h1>
            <p className="text-gray-600">Kelola kos Anda dengan mudah</p>
          </div>
          <Navigation />
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Building2 className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-lg font-bold">{stats.totalKos}</p>
                <p className="text-xs text-gray-600">Total Kos</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Home className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-lg font-bold">{stats.totalRooms}</p>
                <p className="text-xs text-gray-600">Total Kamar</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-lg font-bold">{stats.occupiedRooms}</p>
                <p className="text-xs text-gray-600">Terisi</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <CreditCard className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-lg font-bold">{formatPrice(stats.monthlyRevenue)}</p>
                <p className="text-xs text-gray-600">Pendapatan</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Add Room Button */}
        <div className="md:hidden mb-4">
          <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Kamar Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Tambah Kamar Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="number">Nomor Kamar *</Label>
                  <Input
                    id="number"
                    value={newRoom.number}
                    onChange={(e) => setNewRoom({...newRoom, number: e.target.value})}
                    placeholder="A-101"
                  />
                </div>
                <div>
                  <Label htmlFor="kosName">Nama Kos *</Label>
                  <Input
                    id="kosName"
                    value={newRoom.kosName}
                    onChange={(e) => setNewRoom({...newRoom, kosName: e.target.value})}
                    placeholder="Kos Melati"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Harga per Bulan *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newRoom.price}
                    onChange={(e) => setNewRoom({...newRoom, price: e.target.value})}
                    placeholder="2500000"
                  />
                </div>
                <div>
                  <Label htmlFor="facilities">Fasilitas (pisahkan dengan koma)</Label>
                  <Input
                    id="facilities"
                    value={newRoom.facilities}
                    onChange={(e) => setNewRoom({...newRoom, facilities: e.target.value})}
                    placeholder="WiFi, AC, Kamar Mandi Dalam"
                  />
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button onClick={handleAddRoom} className="flex-1">
                    Tambah
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddRoomOpen(false)} className="flex-1">
                    Batal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Rooms Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Manajemen Kamar
              </CardTitle>
              <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="hidden md:flex">
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah Kamar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Tambah Kamar Baru</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="number">Nomor Kamar *</Label>
                      <Input
                        id="number"
                        value={newRoom.number}
                        onChange={(e) => setNewRoom({...newRoom, number: e.target.value})}
                        placeholder="A-101"
                      />
                    </div>
                    <div>
                      <Label htmlFor="kosName">Nama Kos *</Label>
                      <Input
                        id="kosName"
                        value={newRoom.kosName}
                        onChange={(e) => setNewRoom({...newRoom, kosName: e.target.value})}
                        placeholder="Kos Melati"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Tipe Kamar</Label>
                      <Select value={newRoom.type} onValueChange={(value) => setNewRoom({...newRoom, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Deluxe">Deluxe</SelectItem>
                          <SelectItem value="Premium">Premium</SelectItem>
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
                      <Label htmlFor="facilities">Fasilitas (pisahkan dengan koma)</Label>
                      <Input
                        id="facilities"
                        value={newRoom.facilities}
                        onChange={(e) => setNewRoom({...newRoom, facilities: e.target.value})}
                        placeholder="WiFi, AC, Kamar Mandi Dalam"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Deskripsi</Label>
                      <Textarea
                        id="description"
                        value={newRoom.description}
                        onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                        placeholder="Deskripsi kamar..."
                      />
                    </div>
                    <div className="flex space-x-2 pt-4">
                      <Button onClick={handleAddRoom} className="flex-1">
                        Tambah Kamar
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddRoomOpen(false)} className="flex-1">
                        Batal
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rooms.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Belum ada kamar yang ditambahkan</p>
                  <p className="text-sm">Klik tombol "Tambah Kamar" untuk memulai</p>
                </div>
              ) : (
                rooms.map((room) => (
                  <div key={room.id} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{room.number}</h3>
                          <Badge variant={room.isOccupied ? "default" : "secondary"}>
                            {room.isOccupied ? "Terisi" : "Kosong"}
                          </Badge>
                          {room.status === "pending" && (
                            <Badge variant="destructive">Pending Payment</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{room.kosName}</p>
                        {room.tenantName && (
                          <p className="text-sm text-gray-600">Penghuni: {room.tenantName}</p>
                        )}
                        <p className="text-lg font-bold text-primary mt-1">
                          {formatPrice(room.price)}/bulan
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0 md:ml-4 flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Detail
                        </Button>
                        {room.tenantName && (
                          <Button variant="outline" size="sm">
                            <Phone className="w-4 h-4 mr-1" />
                            Kontak
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}