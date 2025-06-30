import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardStats } from "@/components/dashboard-stats";
import { DashboardTenants } from "@/components/dashboard-tenants";
import { DashboardRooms } from "@/components/dashboard-rooms";
import { DashboardPayments } from "@/components/dashboard-payments";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, Plus, TrendingUp, Calendar } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Kos, Booking } from "@shared/schema";

// Mock user untuk demo - akan diganti dengan real auth nanti
const mockUser = {
  id: 1,
  name: "Ibu Sari",
  email: "sari@example.com",
  role: "pemilik"
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("beranda");
  
  const { data: kosData = [], isLoading: kosLoading } = useQuery<Kos[]>({
    queryKey: ['/api/dashboard/kos', mockUser.id],
    enabled: mockUser.role === 'pemilik'
  });

  const { data: bookingsData = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ['/api/dashboard/bookings', mockUser.id],
    enabled: mockUser.role === 'pemilik'
  });

  const { data: myBookingsData = [], isLoading: myBookingsLoading } = useQuery<Booking[]>({
    queryKey: ['/api/dashboard/my-bookings', mockUser.id],
    enabled: mockUser.role === 'pencari'
  });

  // Mock data untuk demo yang lebih comprehensive
  const mockStats = {
    totalRooms: 24,
    occupiedRooms: 18,
    availableRooms: 6,
    monthlyRevenue: 45000000,
    activeTenants: 18,
    pendingPayments: 3
  };

  const mockTenants = [
    {
      id: 1,
      name: "Ahmad Rizki",
      email: "ahmad@example.com",
      phone: "08123456789",
      roomNumber: "A-101",
      kosName: "Kos Melati",
      checkInDate: "2024-01-15",
      paymentStatus: 'paid' as const,
      rentAmount: 2500000,
      nextPaymentDate: "2025-02-01"
    },
    {
      id: 2,
      name: "Sari Dewi",
      email: "sari@example.com",
      phone: "08234567890",
      roomNumber: "B-205",
      kosName: "Kos Mawar",
      checkInDate: "2024-03-10",
      paymentStatus: 'pending' as const,
      rentAmount: 3000000,
      nextPaymentDate: "2025-01-01"
    },
    {
      id: 3,
      name: "Budi Santoso",
      email: "budi@example.com",
      phone: "08345678901",
      roomNumber: "C-302",
      kosName: "Kos Anggrek",
      checkInDate: "2023-12-05",
      paymentStatus: 'overdue' as const,
      rentAmount: 2800000,
      nextPaymentDate: "2024-12-25"
    }
  ];

  const mockRooms = [
    {
      id: 1,
      number: "A-101",
      kosName: "Kos Melati",
      type: "Standard",
      price: 2500000,
      isOccupied: true,
      tenantName: "Ahmad Rizki",
      facilities: ["WiFi", "Kamar Mandi Dalam", "AC"],
      size: "3x4m",
      floor: 1
    },
    {
      id: 2,
      number: "A-102",
      kosName: "Kos Melati",
      type: "Standard",
      price: 2500000,
      isOccupied: false,
      facilities: ["WiFi", "Kamar Mandi Dalam"],
      size: "3x4m",
      floor: 1
    },
    {
      id: 3,
      number: "B-205",
      kosName: "Kos Mawar",
      type: "Premium",
      price: 3000000,
      isOccupied: true,
      tenantName: "Sari Dewi",
      facilities: ["WiFi", "AC", "Kamar Mandi Dalam", "Parkir"],
      size: "4x5m",
      floor: 2
    }
  ];

  const mockPayments = [
    {
      id: 1,
      tenantName: "Ahmad Rizki",
      roomNumber: "A-101",
      kosName: "Kos Melati",
      amount: 2500000,
      dueDate: "2025-01-01",
      paidDate: "2024-12-28",
      status: 'paid' as const,
      paymentMethod: "Transfer Bank",
      notes: "Pembayaran tepat waktu"
    },
    {
      id: 2,
      tenantName: "Sari Dewi",
      roomNumber: "B-205",
      kosName: "Kos Mawar",
      amount: 3000000,
      dueDate: "2025-01-01",
      status: 'pending' as const
    },
    {
      id: 3,
      tenantName: "Budi Santoso",
      roomNumber: "C-302",
      kosName: "Kos Anggrek",
      amount: 2800000,
      dueDate: "2024-12-25",
      status: 'overdue' as const
    }
  ];

  if (mockUser.role === 'pemilik') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 flex">
        <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-teal-100 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-teal-800">
                  {activeTab === 'beranda' && 'Dashboard Utama'}
                  {activeTab === 'kamar' && 'Manajemen Kamar'}
                  {activeTab === 'penyewa' && 'Daftar Penyewa'}
                  {activeTab === 'pembayaran' && 'Manajemen Pembayaran'}
                  {activeTab === 'pengaturan' && 'Pengaturan'}
                </h1>
                <p className="text-teal-600">
                  Selamat datang kembali, {mockUser.name}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifikasi
                </Button>
                <Button variant="outline" size="sm" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Pesan
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 overflow-y-auto h-full">
            {activeTab === 'beranda' && (
              <div className="space-y-6">
                <DashboardStats stats={mockStats} />
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Button 
                    className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 h-20"
                    onClick={() => setActiveTab('kamar')}
                  >
                    <Plus className="h-6 w-6 mr-2" />
                    Tambah Kamar Baru
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-teal-200 text-teal-700 hover:bg-teal-50 h-20"
                    onClick={() => setActiveTab('penyewa')}
                  >
                    <Bell className="h-6 w-6 mr-2" />
                    Kelola Penyewa
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-teal-200 text-teal-700 hover:bg-teal-50 h-20"
                    onClick={() => setActiveTab('pembayaran')}
                  >
                    <TrendingUp className="h-6 w-6 mr-2" />
                    Laporan Keuangan
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-teal-200 text-teal-700 hover:bg-teal-50 h-20"
                    onClick={() => setActiveTab('pengaturan')}
                  >
                    <MessageSquare className="h-6 w-6 mr-2" />
                    Pengaturan
                  </Button>
                </div>

                {/* Recent Activity */}
                <Card className="bg-gradient-to-br from-white to-teal-50 border-teal-100">
                  <CardHeader>
                    <CardTitle className="text-teal-800">Aktivitas Terbaru</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-green-800">Pembayaran diterima</p>
                          <p className="text-xs text-green-600">Ahmad Rizki - Kamar A-101 - Rp 2.500.000</p>
                        </div>
                        <span className="text-xs text-green-500 ml-auto">2 jam lalu</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-blue-800">Penyewa baru check-in</p>
                          <p className="text-xs text-blue-600">Sari Dewi - Kamar B-205</p>
                        </div>
                        <span className="text-xs text-blue-500 ml-auto">1 hari lalu</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Reminder pembayaran</p>
                          <p className="text-xs text-yellow-600">Budi Santoso - Pembayaran terlambat</p>
                        </div>
                        <span className="text-xs text-yellow-500 ml-auto">3 hari lalu</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'kamar' && <DashboardRooms rooms={mockRooms} />}
            {activeTab === 'penyewa' && <DashboardTenants tenants={mockTenants} />}
            {activeTab === 'pembayaran' && <DashboardPayments payments={mockPayments} />}
            {activeTab === 'pengaturan' && (
              <Card className="bg-gradient-to-br from-white to-teal-50 border-teal-100">
                <CardHeader>
                  <CardTitle className="text-teal-800">Pengaturan Akun</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-teal-600">Halaman pengaturan dalam pengembangan...</p>
                </CardContent>
              </Card>
            )}
          </div>
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