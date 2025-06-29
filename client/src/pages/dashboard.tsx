import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Users, Calendar, Plus, MapPin, Star, Phone } from "lucide-react";
import { formatPrice } from "@/lib/utils";

// Mock user untuk demo - akan diganti dengan real auth nanti
const mockUser = {
  id: 1,
  name: "Ibu Sari",
  email: "sari@example.com",
  role: "pemilik"
};

export default function DashboardPage() {
  const { data: kosData = [], isLoading: kosLoading } = useQuery({
    queryKey: ['/api/dashboard/kos', mockUser.id],
    enabled: mockUser.role === 'pemilik'
  });

  const { data: bookingsData = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['/api/dashboard/bookings', mockUser.id],
    enabled: mockUser.role === 'pemilik'
  });

  const { data: myBookingsData = [], isLoading: myBookingsLoading } = useQuery({
    queryKey: ['/api/dashboard/my-bookings', mockUser.id],
    enabled: mockUser.role === 'pencari'
  });

  if (mockUser.role === 'pemilik') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard Pemilik Kos
            </h1>
            <p className="text-gray-600">
              Kelola kos dan booking Anda, {mockUser.name}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Kos</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kosData.length}</div>
                <p className="text-xs text-muted-foreground">
                  Properti yang Anda kelola
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Booking</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookingsData.length}</div>
                <p className="text-xs text-muted-foreground">
                  Booking yang masuk
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kamar Tersedia</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kosData.reduce((total, kos) => total + kos.availableRooms, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Kamar yang bisa dipesan
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="kos" className="space-y-6">
            <TabsList>
              <TabsTrigger value="kos">Daftar Kos</TabsTrigger>
              <TabsTrigger value="bookings">Booking Masuk</TabsTrigger>
            </TabsList>

            <TabsContent value="kos" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Daftar Kos Anda</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kos Baru
                </Button>
              </div>

              {kosLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                      <CardContent className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-4"></div>
                        <div className="h-6 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {kosData.map((kos) => (
                    <Card key={kos.id} className="overflow-hidden">
                      <div className="h-48 bg-gray-200 relative">
                        {kos.images && kos.images[0] && (
                          <img
                            src={kos.images[0]}
                            alt={kos.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge variant={kos.isAvailable ? "default" : "secondary"}>
                            {kos.isAvailable ? "Tersedia" : "Tidak Tersedia"}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{kos.name}</h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {kos.city}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          {kos.rating} ({kos.reviewCount} review)
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-green-600">
                            {formatPrice(kos.pricePerMonth)}/bulan
                          </span>
                          <Badge variant="outline">
                            {kos.availableRooms}/{kos.totalRooms} kamar
                          </Badge>
                        </div>
                        <Button className="w-full mt-3" variant="outline">
                          Kelola Kos
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <h2 className="text-xl font-semibold">Booking Masuk</h2>

              {bookingsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {bookingsData.map((booking) => {
                    const kos = kosData.find(k => k.id === booking.kosId);
                    return (
                      <Card key={booking.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">
                                Booking #{booking.id}
                              </h3>
                              <p className="text-gray-600">
                                Kos: {kos?.name || 'Unknown'}
                              </p>
                            </div>
                            <Badge
                              variant={
                                booking.status === 'confirmed'
                                  ? 'default'
                                  : booking.status === 'pending'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {booking.status === 'confirmed' && 'Dikonfirmasi'}
                              {booking.status === 'pending' && 'Menunggu'}
                              {booking.status === 'cancelled' && 'Dibatalkan'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium mb-2">Informasi Penyewa</h4>
                              <p className="text-sm">Nama: {booking.customerName}</p>
                              <p className="text-sm">Email: {booking.customerEmail}</p>
                              <div className="flex items-center text-sm">
                                <Phone className="h-3 w-3 mr-1" />
                                {booking.customerPhone}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Detail Booking</h4>
                              <p className="text-sm">
                                Check-in: {new Date(booking.checkInDate).toLocaleDateString('id-ID')}
                              </p>
                              <p className="text-sm">
                                Tanggal booking: {new Date(booking.createdAt).toLocaleDateString('id-ID')}
                              </p>
                              {booking.notes && (
                                <p className="text-sm">Catatan: {booking.notes}</p>
                              )}
                            </div>
                          </div>

                          {booking.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  // TODO: Implement confirm booking
                                  console.log('Confirm booking', booking.id);
                                }}
                              >
                                Konfirmasi
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  // TODO: Implement reject booking
                                  console.log('Reject booking', booking.id);
                                }}
                              >
                                Tolak
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Dashboard untuk pencari kos
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Pencari Kos
          </h1>
          <p className="text-gray-600">
            Lihat riwayat booking Anda, {mockUser.name}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Riwayat Booking Saya</CardTitle>
            <CardDescription>
              Daftar kos yang pernah Anda booking
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myBookingsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : myBookingsData.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada booking</p>
                <p className="text-sm text-gray-400">
                  Mulai cari kos impian Anda sekarang!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookingsData.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">Booking #{booking.id}</h3>
                        <p className="text-sm text-gray-600">
                          Check-in: {new Date(booking.checkInDate).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <Badge
                        variant={
                          booking.status === 'confirmed'
                            ? 'default'
                            : booking.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {booking.status === 'confirmed' && 'Dikonfirmasi'}
                        {booking.status === 'pending' && 'Menunggu'}
                        {booking.status === 'cancelled' && 'Dibatalkan'}
                      </Badge>
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