import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Star, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import { type Kos } from "@shared/schema";
import { formatPrice, formatRating } from "@/lib/utils";

interface KosCardProps {
  kos: Kos;
  onViewDetails: (kos: Kos) => void;
  onBook: (kos: Kos) => void;
}

export default function KosCard({ kos, onViewDetails, onBook }: KosCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === kos.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? kos.images.length - 1 : prev - 1
    );
  };

  const handleWhatsAppContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `Halo, saya tertarik dengan ${kos.name} di ${kos.address}. Apakah masih tersedia?`;
    const whatsappUrl = `https://wa.me/${kos.ownerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStatusBadge = () => {
    if (!kos.isAvailable || kos.availableRooms === 0) {
      return <Badge variant="destructive">Penuh</Badge>;
    }
    if (kos.availableRooms <= 2) {
      return <Badge className="bg-orange-500 hover:bg-orange-600">Hampir Penuh</Badge>;
    }
    if (kos.isPromoted) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Premium</Badge>;
    }
    return <Badge className="bg-primary hover:bg-primary/90">Tersedia</Badge>;
  };

  const getTypeBadge = () => {
    const typeColors = {
      putra: "bg-blue-500 hover:bg-blue-600",
      putri: "bg-pink-500 hover:bg-pink-600",
      campur: "bg-purple-500 hover:bg-purple-600"
    };
    
    return (
      <Badge className={typeColors[kos.type as keyof typeof typeColors]}>
        {kos.type.charAt(0).toUpperCase() + kos.type.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      <div className="relative">
        <img
          src={kos.images[currentImageIndex] || kos.images[0]}
          alt={`${kos.name} - Foto ${currentImageIndex + 1}`}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={() => onViewDetails(kos)}
        />
        
        {/* Image slider controls */}
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
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-4 left-4">
          {getStatusBadge()}
        </div>
        <div className="absolute top-4 right-4 space-y-2">
          {getTypeBadge()}
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/80 hover:bg-white transition-all block"
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorited(!isFavorited);
            }}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {kos.name}
          </h3>
          <div className="flex items-center text-sm text-gray-600">
            <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
            <span>{formatRating(kos.rating)}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
          {kos.address}
        </p>
        
        {/* Facilities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {kos.facilities.slice(0, 4).map((facility, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {facility}
            </Badge>
          ))}
          {kos.facilities.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{kos.facilities.length - 4}
            </Badge>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(kos.pricePerMonth)}
              </span>
              <span className="text-gray-500 text-sm">/bulan</span>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{kos.ownerName}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="flex-1 bg-green-50 border-green-500 text-green-700 hover:bg-green-100"
              onClick={handleWhatsAppContact}
            >
              <Phone className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
              onClick={(e) => {
                e.stopPropagation();
                onBook(kos);
              }}
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
