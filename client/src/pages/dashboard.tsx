import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import CompactDashboard from "@/components/compact-dashboard";
import { 
  User, 
  LogOut, 
  Menu,
  Phone,
  Calendar,
  Building2
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Provide better user name display
  const displayName = currentUser.name && currentUser.name !== "WhatsApp User" 
    ? currentUser.name 
    : "Pencari Kos";
  
  // Get user bookings from localStorage for pencari kos
  const userBookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
  
  // Remove duplicates based on kosId and booking date
  const uniqueBookings = userBookings.filter((booking: any, index: number, self: any[]) => {
    return index === self.findIndex((b: any) => 
      b.kosId === booking.kosId && 
      b.bookingDate === booking.bookingDate
    );
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    setLocation("/login");
  };

  const Navigation = ({ isMobile = false }) => (
    <nav className={`${isMobile ? "space-y-2" : "flex space-x-4"}`}>
      <Button
        variant="ghost"
        onClick={() => setLocation("/profile")}
        className={`${isMobile ? "w-full justify-start" : ""} text-gray-600 hover:text-primary`}
      >
        <User className="w-4 h-4 mr-2" />
        Profil
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

  // Use compact dashboard for pemilik kos
  if (currentUser.role === "pemilik") {
    return <CompactDashboard />;
  }

  // Dashboard for pencari kos
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <p className="text-sm text-gray-600">Halo, {displayName}</p>
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
            <p className="text-gray-600">Selamat datang, {displayName}</p>
          </div>
          <Navigation />
        </div>
      </div>

      <div className="p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Riwayat Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            {uniqueBookings.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum Ada Booking</h3>
                <p className="text-gray-600 mb-4">Anda belum melakukan booking kos apapun</p>
                <Button
                  onClick={() => setLocation("/")}
                  className="mt-4"
                >
                  Cari Kos Sekarang
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {uniqueBookings.map((booking: any, index: number) => (
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
                      <div className="mt-4 md:mt-0 md:ml-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        {booking.paymentStatus === 'processing' ? (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Menunggu Verifikasi
                          </Badge>
                        ) : booking.paymentStatus === 'paid' ? (
                          <Badge className="bg-green-100 text-green-800">
                            Pembayaran Dikonfirmasi
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800">
                            Booking Aktif
                          </Badge>
                        )}
                        <div className="flex gap-2">
                          {booking.paymentId && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLocation(`/payment?id=${booking.paymentId}`)}
                            >
                              Bayar Sekarang
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const message = `Halo, saya ingin menanyakan tentang booking kos ${booking.kosName} yang telah saya lakukan pada tanggal ${booking.bookingDate}. Terima kasih.`;
                              window.open(`https://wa.me/${booking.ownerPhone || '6281234567890'}?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Hubungi
                          </Button>
                        </div>
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