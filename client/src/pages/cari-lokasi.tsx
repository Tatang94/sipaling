import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import LocationMap from '@/components/location-map';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Navigation, Home, Users, Wifi, Car, AirVent, Utensils } from 'lucide-react';

export default function CariLokasiPage() {
  const [, setLocation] = useLocation();
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedLocation({ lat, lng, address });
  };

  // Fetch kos data from database
  const { data: kosData = [], isLoading } = useQuery({
    queryKey: ['/api/kos/featured'],
    enabled: true
  });

  // Calculate distance and create nearby kos data
  const [nearbyKos, setNearbyKos] = useState<any[]>([]);

  useEffect(() => {
    if (selectedLocation && kosData.length > 0) {
      // Calculate distance from selected location to each kos
      const kosWithDistance = kosData.map((kos: any) => {
        const distance = calculateDistance(
          selectedLocation.lat,
          selectedLocation.lng,
          parseFloat(kos.latitude || '0'),
          parseFloat(kos.longitude || '0')
        );
        
        return {
          ...kos,
          distance: `${distance.toFixed(1)} km`
        };
      }).sort((a: any, b: any) => a.distance - b.distance).slice(0, 5);
      
      setNearbyKos(kosWithDistance);
    } else if (kosData.length > 0) {
      // Show featured kos if no location selected
      setNearbyKos(kosData.slice(0, 5));
    }
  }, [selectedLocation, kosData]);

  // Helper function to calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

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
                  {isLoading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Memuat data kos...</p>
                    </div>
                  ) : nearbyKos.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Belum ada data kos tersedia</p>
                    </div>
                  ) : 
                    nearbyKos.map((kos) => (
                    <div key={kos.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        <img 
                          src={kos.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop"} 
                          alt={kos.name}
                          className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            // Navigate to booking/payment
                            const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                            const bookingData = {
                              id: Date.now(),
                              kosId: kos.id,
                              kosName: kos.name,
                              amount: parseFloat(kos.pricePerMonth || '0'),
                              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                              status: 'pending',
                              paymentId: paymentId,
                              createdAt: new Date().toISOString()
                            };
                            
                            const existingBookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
                            existingBookings.push(bookingData);
                            localStorage.setItem("userBookings", JSON.stringify(existingBookings));
                            
                            setLocation(`/payment?id=${paymentId}`);
                          }}
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
                                Rp {parseFloat(kos.pricePerMonth || '0').toLocaleString('id-ID')}
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
                          

                        </div>
                      </div>
                    </div>
                  ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}