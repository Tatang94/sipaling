import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, Heart, MapPin, X, Wifi, Car, Utensils, AirVent, Tv, Bath, Shield, Coffee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { formatPrice, formatRating } from "@/lib/utils";
import type { Kos } from "@/shared/schema";

interface KosDetailModalProps {
  kos: Kos | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (kos: Kos) => void;
}

const facilityIcons: Record<string, any> = {
  "WiFi": Wifi,
  "Parkir": Car,
  "Dapur": Utensils,
  "AC": AirVent,
  "TV": Tv,
  "Kamar Mandi Dalam": Bath,
  "Keamanan 24 Jam": Shield,
  "Area Makan": Coffee,
};

export default function KosDetailModal({ kos, isOpen, onClose, onBook }: KosDetailModalProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  if (!kos) return null;

  const handleBook = () => {
    // Check if user is logged in (simple check for demo)
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    
    if (!isLoggedIn) {
      toast({
        title: "Login Diperlukan",
        description: "Silakan login terlebih dahulu untuk melakukan booking",
      });
      onClose();
      setLocation("/login");
      return;
    }

    // Create booking data
    const bookingData = {
      id: Date.now(),
      kosId: kos.id,
      kosName: kos.name,
      ownerName: kos.ownerName,
      ownerPhone: kos.ownerPhone,
      address: kos.address,
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

    onClose();
    
    // Redirect to dashboard after successful booking
    setTimeout(() => {
      setLocation("/dashboard");
    }, 2000);
  };

  const getFacilityIcon = (facility: string) => {
    return facilityIcons[facility] || Utensils;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 overflow-hidden" aria-describedby="kos-description">
        <DialogHeader className="relative px-4 md:px-6 py-4 border-b border-gray-200">
          <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 pr-10">
            {kos.name}
          </DialogTitle>
          <div className="flex items-center space-x-3 mt-2">
            <div className="flex items-center text-sm text-gray-600">
              <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
              <span className="mr-2">{formatRating(kos.rating)}</span>
              <span>({kos.reviewCount} ulasan)</span>
            </div>
            <Badge className={kos.type === 'putra' ? 'bg-blue-500' : kos.type === 'putri' ? 'bg-pink-500' : 'bg-purple-500'}>
              {kos.type.charAt(0).toUpperCase() + kos.type.slice(1)}
            </Badge>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-2 top-2 md:right-4 md:top-4">
              <X className="w-5 h-5" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="p-4 md:p-6 space-y-6">
            {/* Description */}
            <div id="kos-description">
              <p className="text-gray-600 leading-relaxed">{kos.description}</p>
            </div>

            {/* Lokasi */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                Lokasi
              </h3>
              <p className="text-gray-600 text-sm mb-3">{kos.address}</p>
              
              {/* Map Placeholder */}
              <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm">Peta Lokasi</span>
                </div>
              </div>
            </div>

            {/* Fasilitas */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Fasilitas</h3>
              <div className="grid grid-cols-2 gap-2">
                {kos.facilities.map((facility, index) => {
                  const Icon = getFacilityIcon(facility);
                  return (
                    <div key={index} className="flex items-center text-sm text-gray-600 py-1">
                      <Icon className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                      <span>{facility}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Informasi Kamar */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Informasi Kamar</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tipe:</span>
                  <p className="font-medium capitalize">{kos.type}</p>
                </div>
                <div>
                  <span className="text-gray-600">Tersedia:</span>
                  <p className="font-medium text-primary">{kos.availableRooms} kamar</p>
                </div>
                <div>
                  <span className="text-gray-600">Ukuran:</span>
                  <p className="font-medium">{kos.roomSize || "3x4 meter"}</p>
                </div>
                <div>
                  <span className="text-gray-600">Pembayaran:</span>
                  <p className="font-medium capitalize">{kos.paymentType}</p>
                </div>
              </div>
            </div>

            {/* Kontak Pemilik */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Kontak Pemilik</h3>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">{kos.ownerName}</p>
                <p className="text-sm text-gray-600">{kos.ownerPhone}</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Pricing & Booking */}
        <div className="border-t border-gray-200 px-4 py-4 md:px-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl md:text-3xl font-bold text-primary">
              {formatPrice(kos.pricePerMonth)}
              <span className="text-base md:text-lg text-gray-500 font-normal">/bulan</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFavorited(!isFavorited)}
            >
              <Heart className={`w-4 h-4 mr-1 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              Simpan
            </Button>
          </div>
          
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium transition-colors"
            onClick={handleBook}
            disabled={!kos.isAvailable || kos.availableRooms === 0}
          >
            {kos.isAvailable && kos.availableRooms > 0 ? "Book Sekarang" : "Tidak Tersedia"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}