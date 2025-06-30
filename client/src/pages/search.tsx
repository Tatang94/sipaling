import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import KosCard from "@/components/kos-card";
import KosDetailModal from "@/components/kos-detail-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, MapPin } from "lucide-react";
import { type Kos } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function SearchPage() {
  const [location, setLocation] = useLocation();
  const [selectedKos, setSelectedKos] = useState<Kos | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const { toast } = useToast();

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    setSearchQuery(urlParams.get('q') || '');
    setSelectedCity(urlParams.get('city') || 'all');
    setSelectedType(urlParams.get('type') || 'semua');
    setPriceRange(urlParams.get('price') || 'all');
  }, [location]);

  // Build query parameters for API
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCity && selectedCity !== 'all') params.set('city', selectedCity);
    if (selectedType && selectedType !== 'semua') params.set('type', selectedType);
    if (priceRange && priceRange !== 'all') params.set('price', priceRange);
    return params.toString();
  };

  const { data: kosList, isLoading, refetch } = useQuery<Kos[]>({
    queryKey: ['/api/kos/search?' + buildQueryParams()],
    enabled: true,
  });

  const handleSearch = () => {
    refetch();
  };

  const handleBook = (kos: Kos) => {
    // Check if user is logged in
    const user = localStorage.getItem("user");
    if (!user) {
      toast({
        title: "Login Diperlukan",
        description: "Silakan login terlebih dahulu untuk melakukan booking",
        variant: "destructive",
      });
      // Redirect to login page
      setTimeout(() => {
        setLocation("/login");
      }, 1500);
      return;
    }

    // Create booking data
    const bookingData = {
      kosId: kos.id,
      kosName: kos.name,
      ownerPhone: kos.ownerPhone,
      pricePerMonth: kos.pricePerMonth,
      bookingDate: new Date().toISOString().split('T')[0],
    };

    // Save to localStorage for now (in real app, would save to database)
    const existingBookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
    existingBookings.push(bookingData);
    localStorage.setItem("userBookings", JSON.stringify(existingBookings));

    toast({
      title: "Booking Berhasil!",
      description: `Booking untuk ${kos.name} telah dikonfirmasi. Hubungi pemilik di ${kos.ownerPhone}`,
    });

    // Redirect to dashboard after successful booking
    setTimeout(() => {
      setLocation("/dashboard");
    }, 2000);
  };

  const handleViewDetails = (kos: Kos) => {
    setSelectedKos(kos);
  };

  const cities = [
    { value: "all", label: "Semua Kota" },
    { value: "jakarta", label: "Jakarta" },
    { value: "bandung", label: "Bandung" },
    { value: "surabaya", label: "Surabaya" },
    { value: "yogyakarta", label: "Yogyakarta" },
  ];

  const types = [
    { value: "semua", label: "Semua Tipe" },
    { value: "putra", label: "Putra" },
    { value: "putri", label: "Putri" },
    { value: "campur", label: "Campur" },
  ];

  const priceRanges = [
    { value: "all", label: "Semua Harga" },
    { value: "500000-1000000", label: "Rp 500.000 - Rp 1.000.000" },
    { value: "1000000-2000000", label: "Rp 1.000.000 - Rp 2.000.000" },
    { value: "2000000-3000000", label: "Rp 2.000.000 - Rp 3.000.000" },
    { value: "3000000-", label: "Rp 3.000.000+" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Cari Kos Impian Anda
          </h1>
          
          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Cari nama kos atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kota" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipe Kos" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleSearch}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              Cari
            </Button>
          </div>
          
          {/* Additional Filters */}
          <div className="mt-4 flex flex-wrap gap-4">
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-auto">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Rentang Harga" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
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
        ) : kosList && kosList.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Ditemukan {kosList.length} kos yang sesuai
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {kosList.map((kos) => (
                <KosCard
                  key={kos.id}
                  kos={kos}
                  onViewDetails={handleViewDetails}
                  onBook={handleBook}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Tidak ada kos yang ditemukan
            </h3>
            <p className="text-gray-600">
              Coba ubah filter pencarian atau kata kunci yang berbeda
            </p>
          </div>
        )}
      </div>

      {/* Kos Detail Modal */}
      <KosDetailModal
        kos={selectedKos}
        isOpen={!!selectedKos}
        onClose={() => setSelectedKos(null)}
        onBook={handleBook}
      />

      <Footer />
    </div>
  );
}
