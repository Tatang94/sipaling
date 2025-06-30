import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, Heart, MapPin, X, Wifi, Car, Utensils, AirVent, Tv, Bath, Shield, Coffee, ChevronLeft, ChevronRight, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { formatPrice, formatRating } from "@/lib/utils";
import type { Kos } from "../../../shared/schema";

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  if (!kos) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === kos.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? kos.images.length - 1 : prev - 1
    );
  };

  const handleWhatsAppContact = () => {
    const message = `Halo ${kos.ownerName}, saya tertarik dengan ${kos.name} di ${kos.address}. Apakah masih tersedia? Terima kasih.`;
    const whatsappUrl = `https://wa.me/${kos.ownerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

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
      <DialogContent className="max-w-md w-[90vw] max-h-[85vh] p-0 overflow-hidden sm:max-w-2xl sm:w-full flex flex-col" aria-describedby="kos-description">
        <DialogHeader className="relative px-3 py-2 border-b border-gray-200 flex-shrink-0">
          <DialogTitle className="text-base font-bold text-gray-900 pr-8 leading-tight">
            {kos.name}
          </DialogTitle>
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex items-center text-xs text-gray-600">
              <Star className="w-3 h-3 text-yellow-400 mr-1 fill-current" />
              <span className="mr-1">{formatRating(kos.rating)}</span>
              <span>({kos.reviewCount})</span>
            </div>
            <Badge className={`text-xs px-2 py-0.5 ${kos.type === 'putra' ? 'bg-blue-500' : kos.type === 'putri' ? 'bg-pink-500' : 'bg-purple-500'}`}>
              {kos.type.charAt(0).toUpperCase() + kos.type.slice(1)}
            </Badge>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-1 top-1 w-7 h-7">
              <X className="w-4 h-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="space-y-3 pb-4">
            {/* Image Gallery */}
            <div className="relative">
              <img
                src={kos.images[currentImageIndex] || kos.images[0]}
                alt={`${kos.name} - Foto ${currentImageIndex + 1}`}
                className="w-full h-48 sm:h-64 object-cover"
              />
              
              {/* Image carousel controls */}
              {kos.images && kos.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  {/* Image indicators */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {kos.images.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-3 space-y-3">
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
                {kos.facilities.map((facility: string, index: number) => {
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
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-base font-semibold mb-2">Kontak Pemilik</h3>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">{kos.ownerName}</p>
                <p className="text-sm text-gray-600">{kos.ownerPhone}</p>
              </div>
            </div>
            
            {/* Extra padding to ensure content can be scrolled */}
            <div className="h-4"></div>
            </div>
          </div>
        </ScrollArea>

        {/* Pricing & Booking */}
        <div className="border-t border-gray-200 px-3 py-2 bg-white flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-bold text-primary">
              {formatPrice(kos.pricePerMonth)}
              <span className="text-xs text-gray-500 font-normal">/bulan</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFavorited(!isFavorited)}
              className="px-2 py-1 h-7"
            >
              <Heart className={`w-3 h-3 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="flex-1 bg-green-50 border-green-500 text-green-700 hover:bg-green-100 py-2 rounded-lg font-medium transition-colors text-sm"
              onClick={handleWhatsAppContact}
            >
              <Phone className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 rounded-lg font-medium transition-colors text-sm"
              onClick={handleBook}
              disabled={!kos.isAvailable || kos.availableRooms === 0}
            >
              {kos.isAvailable && kos.availableRooms > 0 ? "Book Sekarang" : "Tidak Tersedia"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}