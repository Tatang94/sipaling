import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import KosCard from "./kos-card";
import KosDetailModal from "./kos-detail-modal";
import { type Kos } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Navigation, MapPin } from "lucide-react";

interface NearbyKos extends Kos {
  distance?: number;
}

export default function FeaturedKos() {
  const [selectedKos, setSelectedKos] = useState<Kos | null>(null);
  const [filterType, setFilterType] = useState("semua");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [nearbyKos, setNearbyKos] = useState<NearbyKos[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Get featured kos (fallback)
  const { data: featuredKosList, isLoading: isFeaturedLoading } = useQuery<Kos[]>({
    queryKey: ["/api/kos/featured"],
  });

  // Get user location automatically
  useEffect(() => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          fetchNearbyKos(lat, lng);
        },
        (error) => {
          console.error('GPS error:', error);
          setIsGettingLocation(false);
          // Use featured kos as fallback
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 60000
        }
      );
    } else {
      setIsGettingLocation(false);
    }
  }, []);

  // Fetch nearby kos based on GPS
  const fetchNearbyKos = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/kos/nearby?lat=${lat}&lng=${lng}&radius=20&limit=12`);
      const data = await response.json();
      
      if (data && Array.isArray(data) && data.length > 0) {
        setNearbyKos(data);
      }
    } catch (error) {
      console.error('Error fetching nearby kos:', error);
    }
    setIsGettingLocation(false);
  };

  // Use nearby kos if available, otherwise use featured kos
  const kosList = nearbyKos.length > 0 ? nearbyKos : featuredKosList || [];
  const isLoading = isGettingLocation || (nearbyKos.length === 0 && isFeaturedLoading);

  const filteredKos = kosList?.filter(kos => {
    if (filterType === "semua") return true;
    return kos.type === filterType;
  }) || [];

  const filterTabs = [
    { key: "semua", label: "Semua" },
    { key: "putra", label: "Putra" },
    { key: "putri", label: "Putri" },
    { key: "campur", label: "Campur" },
  ];

  const handleBook = (kos: Kos) => {
    // Check if user is logged in (support both user data formats)
    const user = localStorage.getItem("user");
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    
    if (!user && !hasSeenOnboarding) {
      toast({
        title: "Login Diperlukan",
        description: "Silakan login terlebih dahulu untuk melakukan booking",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/login");
      }, 1500);
      return;
    }

    // Create booking and payment data
    const userData = user ? JSON.parse(user) : { id: 999, name: "Pencari Kos", role: "pencari" };
    
    // Create sample payment for this booking
    const paymentId = Math.floor(Math.random() * 1000) + 100;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days
    
    const paymentData = {
      id: paymentId,
      bookingId: paymentId,
      tenantName: userData.name,
      roomNumber: `${kos.id.toString().padStart(2, '0')}1`,
      kosName: kos.name,
      amount: kos.pricePerMonth,
      dueDate: dueDate.toISOString(),
      status: "pending",
      ownerId: kos.ownerId || 1
    };

    // Save booking data
    const bookingData = {
      kosId: kos.id,
      kosName: kos.name,
      ownerPhone: kos.ownerPhone,
      pricePerMonth: kos.pricePerMonth,
      bookingDate: new Date().toISOString().split('T')[0],
      paymentId: paymentId
    };

    const existingBookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
    existingBookings.push(bookingData);
    localStorage.setItem("userBookings", JSON.stringify(existingBookings));

    toast({
      title: "Booking Berhasil!",
      description: `Silakan lakukan pembayaran untuk menyelesaikan booking`,
    });

    // Redirect to payment page
    setTimeout(() => {
      setLocation(`/payment?id=${paymentId}`);
    }, 1500);
  };

  const handleViewDetails = (kos: Kos) => {
    setSelectedKos(kos);
  };

  if (isLoading) {
    return (
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {userLocation && (
                <MapPin className="w-5 h-5 text-teal-600" />
              )}
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {nearbyKos.length > 0 ? 'Kos Terdekat' : 'Kos Rekomendasi'}
              </h2>
            </div>
            <p className="text-gray-600">
              {nearbyKos.length > 0 
                ? `Ditemukan ${nearbyKos.length} kos terdekat dari lokasi Anda`
                : 'Pilihan terbaik dengan fasilitas lengkap dan lokasi strategis'
              }
            </p>
            {nearbyKos.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/nearby')}
                className="mt-2 text-teal-600 border-teal-600 hover:bg-teal-50"
              >
                Lihat Semua Kos Terdekat
              </Button>
            )}
          </div>
          
          {/* Filter Tabs */}
          <div className="flex space-x-4 mt-6 md:mt-0">
            {filterTabs.map((tab) => (
              <Button
                key={tab.key}
                variant={filterType === tab.key ? "default" : "secondary"}
                className={filterType === tab.key ? "bg-primary hover:bg-primary/90" : ""}
                onClick={() => setFilterType(tab.key)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Kos Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredKos.map((kos) => (
            <KosCard
              key={kos.id}
              kos={kos}
              onViewDetails={handleViewDetails}
              onBook={handleBook}
            />
          ))}
        </div>

        {filteredKos.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada kos yang ditemukan untuk filter ini.</p>
          </div>
        )}

        {/* Load More Button */}
        {filteredKos.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Lihat Lebih Banyak
            </Button>
          </div>
        )}

        {/* Kos Detail Modal */}
        <KosDetailModal
          kos={selectedKos}
          isOpen={!!selectedKos}
          onClose={() => setSelectedKos(null)}
          onBook={handleBook}
        />
      </div>
    </section>
  );
}
