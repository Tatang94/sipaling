import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Star } from "lucide-react";
import { type Kos } from "@shared/schema";
import { formatPrice, formatRating } from "@/lib/utils";

interface KosCardProps {
  kos: Kos;
  onViewDetails: (kos: Kos) => void;
  onBook: (kos: Kos) => void;
}

export default function KosCard({ kos, onViewDetails, onBook }: KosCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

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
          src={kos.images[0]}
          alt={kos.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={() => onViewDetails(kos)}
        />
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
          <h3 
            className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors cursor-pointer"
            onClick={() => onViewDetails(kos)}
          >
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
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary">
              {formatPrice(kos.pricePerMonth)}
            </span>
            <span className="text-gray-500 text-sm">/bulan</span>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onBook(kos);
            }}
          >
            Book Now
          </Button>
        </div>
      </div>
    </Card>
  );
}
