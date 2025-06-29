import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Star, MapPin, Heart, Bed, Armchair, Shirt, Snowflake, Wifi, Car, Utensils, Shield, Tv } from "lucide-react";
import { type Kos } from "@shared/schema";
import { formatPrice, formatRating } from "@/lib/utils";

interface KosDetailModalProps {
  kos: Kos | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (kos: Kos) => void;
}

const facilityIcons: { [key: string]: any } = {
  "WiFi": Wifi,
  "AC": Snowflake,
  "Parkir": Car,
  "Dapur": Utensils,
  "Laundry": Shirt,
  "Keamanan 24/7": Shield,
  "TV": Tv,
  "Kasur": Bed,
  "Meja": Armchair,
  "Lemari": Armchair,
  "Ruang Belajar": Bed,
  "Khusus Putri": Shield,
  "Dapur Bersama": Utensils,
  "Parkir Motor": Car,
  "Kamar Mandi Dalam": Utensils,
  "WiFi 100Mbps": Wifi,
  "Gym": Bed,
  "Cafe": Utensils,
  "Laundry Premium": Shirt,
};

export default function KosDetailModal({ kos, isOpen, onClose, onBook }: KosDetailModalProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  if (!kos) return null;

  const handleBook = () => {
    onBook(kos);
    onClose();
  };

  const getFacilityIcon = (facility: string) => {
    const Icon = facilityIcons[facility] || Utensils;
    return <Icon className="w-4 h-4 mr-2 text-gray-400" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden" aria-describedby="kos-description">
        <DialogHeader className="border-b border-gray-200 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                {kos.name}
              </DialogTitle>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                  <span className="mr-2">{formatRating(kos.rating)}</span>
                  <span>({kos.reviewCount} ulasan)</span>
                </div>
                <Badge className={kos.type === 'putra' ? 'bg-blue-500' : kos.type === 'putri' ? 'bg-pink-500' : 'bg-purple-500'}>
                  {kos.type.charAt(0).toUpperCase() + kos.type.slice(1)}
                </Badge>
              </div>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="w-5 h-5" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-8">
            {/* Image Gallery */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {kos.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Foto ${kos.name} ${index + 1}`}
                  className="rounded-lg object-cover h-32 w-full cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
            </div>

            {/* Kos Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Informasi Kos</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipe Kos:</span>
                    <span className="font-medium capitalize">{kos.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ukuran Kamar:</span>
                    <span className="font-medium">{kos.roomSize || "3x4 meter"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kamar Tersedia:</span>
                    <span className="font-medium text-primary">{kos.availableRooms} dari {kos.totalRooms} kamar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sistem Pembayaran:</span>
                    <span className="font-medium capitalize">{kos.paymentType}</span>
                  </div>
                </div>

                <h4 className="text-lg font-semibold mt-6 mb-3">Fasilitas</h4>
                <div className="grid grid-cols-2 gap-2">
                  {kos.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center text-sm">
                      {getFacilityIcon(facility)}
                      {facility}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Deskripsi</h3>
                <p id="kos-description" className="text-gray-600 text-sm mb-6 leading-relaxed">
                  {kos.description}
                </p>

                <h4 className="text-lg font-semibold mb-3">Lokasi</h4>
                <p className="text-gray-600 text-sm mb-4 flex items-start">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                  {kos.address}
                </p>
                
                {/* Map Placeholder */}
                <div className="bg-gray-200 rounded-lg h-32 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm">Peta Lokasi</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold text-sm mb-2">Kontak Pemilik</h5>
                  <p className="text-sm text-gray-600">{kos.ownerName}</p>
                  <p className="text-sm text-gray-600">{kos.ownerPhone}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Pricing & Booking */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                {formatPrice(kos.pricePerMonth)}
                <span className="text-lg text-gray-500 font-normal">/bulan</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                <span className="mr-2">{formatRating(kos.rating)}</span>
                <span>({kos.reviewCount} ulasan)</span>
              </div>
            </div>
            <div className="flex space-x-3 w-full md:w-auto">
              <Button
                variant="outline"
                className="flex-1 md:flex-none"
                onClick={() => setIsFavorited(!isFavorited)}
              >
                <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                Simpan
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium transition-colors flex-1 md:flex-none"
                onClick={handleBook}
                disabled={!kos.isAvailable || kos.availableRooms === 0}
              >
                {kos.isAvailable && kos.availableRooms > 0 ? "Book Sekarang" : "Tidak Tersedia"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
