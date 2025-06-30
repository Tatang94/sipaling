import { useState } from 'react';
import { Link } from 'wouter';
import LocationMap from '@/components/location-map';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Navigation, Home, Users, Wifi, Car, AirVent, Utensils } from 'lucide-react';

export default function CariLokasiPage() {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedLocation({ lat, lng, address });
  };

  // Data kos simulasi berdasarkan lokasi
  const nearbyKos = [
    {
      id: 1,
      name: "Kos Putri Menteng Executive",
      type: "Khusus Putri",
      price: 1500000,
      distance: "0.5 km",
      rating: 4.8,
      facilities: ["WiFi", "AC", "Kamar Mandi Dalam", "Parkir", "Dapur"],
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
      address: "Jl. Menteng Raya No. 45"
    },
    {
      id: 2,
      name: "Kos Executive Sudirman",
      type: "Campuran",
      price: 2500000,
      distance: "0.8 km",
      rating: 4.9,
      facilities: ["WiFi", "AC", "Kamar Mandi Dalam", "Parkir", "Laundry"],
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
      address: "Jl. Sudirman No. 123"
    },
    {
      id: 3,
      name: "Kos Putra Kemang",
      type: "Khusus Putra", 
      price: 1800000,
      distance: "1.2 km",
      rating: 4.7,
      facilities: ["WiFi", "AC", "Kamar Mandi Dalam", "Dapur Bersama"],
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
      address: "Jl. Kemang Raya No. 78"
    }
  ];

  const getFacilityIcon = (facility: string) => {
    switch (facility) {
      case "WiFi": return <Wifi className="h-3 w-3" />;
      case "AC": return <AirVent className="h-3 w-3" />;
      case "Kamar Mandi Dalam": return <Home className="h-3 w-3" />;
      case "Parkir": return <Car className="h-3 w-3" />;
      case "Dapur": case "Dapur Bersama": return <Utensils className="h-3 w-3" />;
      case "Laundry": return <Users className="h-3 w-3" />;
      default: return <Home className="h-3 w-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Cari Kos Terdekat</h1>
              <p className="text-sm text-gray-600">Temukan kos di sekitar lokasi Anda</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Peta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Peta Lokasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LocationMap 
                onLocationSelect={handleLocationSelect}
                showKosLocations={true}
              />
            </CardContent>
          </Card>

          {/* Informasi Lokasi dan Hasil */}
          <div className="space-y-6">
            {/* Info Lokasi Terpilih */}
            {selectedLocation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-blue-600" />
                    Lokasi Dipilih
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Alamat:</p>
                    <p className="font-medium">{selectedLocation.address}</p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Lat: {selectedLocation.lat.toFixed(6)}</span>
                      <span>Lng: {selectedLocation.lng.toFixed(6)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Kos Terdekat */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-teal-600" />
                  Kos Terdekat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nearbyKos.map((kos) => (
                    <div key={kos.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        <img 
                          src={kos.image} 
                          alt={kos.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-sm">{kos.name}</h3>
                              <p className="text-xs text-gray-600">{kos.address}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {kos.type}
                                </Badge>
                                <span className="text-xs text-gray-500">📍 {kos.distance}</span>
                                <span className="text-xs text-gray-500">⭐ {kos.rating}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600 text-sm">
                                Rp {kos.price.toLocaleString('id-ID')}
                              </p>
                              <p className="text-xs text-gray-500">/bulan</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {kos.facilities.slice(0, 3).map((facility, index) => (
                              <div key={index} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {getFacilityIcon(facility)}
                                <span>{facility}</span>
                              </div>
                            ))}
                            {kos.facilities.length > 3 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{kos.facilities.length - 3} lainnya
                              </span>
                            )}
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="flex-1">
                              Lihat Detail
                            </Button>
                            <Button size="sm" variant="outline">
                              Kontak
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}