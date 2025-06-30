import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { MapPin, Navigation, Star, Users, Wifi, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

interface NearbyKos {
  id: number;
  name: string;
  description: string;
  address: string;
  pricePerMonth: string;
  type: string;
  rating: string;
  reviewCount: number;
  facilities: string[];
  images: string[];
  availableRooms: number;
  distance: number;
  latitude: string;
  longitude: string;
}

export default function NearbyKosPage() {
  const [, setLocation] = useLocation();
  const [nearbyKos, setNearbyKos] = useState<NearbyKos[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationName, setLocationName] = useState("");

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          
          // Get location name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            setLocationName(data.display_name || `${lat}, ${lng}`);
          } catch (error) {
            console.error('Error getting location name:', error);
            setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
          
          // Fetch nearby kos
          fetchNearbyKos(lat, lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
          // Use default Tasikmalaya coordinates if GPS fails
          const defaultLat = -7.3374;
          const defaultLng = 108.2183;
          setUserLocation({ lat: defaultLat, lng: defaultLng });
          setLocationName("Tasikmalaya, Jawa Barat");
          fetchNearbyKos(defaultLat, defaultLng);
        }
      );
    } else {
      setLoading(false);
    }
  };

  // Fetch nearby kos from API
  const fetchNearbyKos = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/kos/nearby?lat=${lat}&lng=${lng}&radius=15&limit=20`);
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        setNearbyKos(data);
      }
    } catch (error) {
      console.error('Error fetching nearby kos:', error);
    }
    setLoading(false);
  };

  // Handle booking
  const handleBook = (kos: NearbyKos) => {
    // Store booking data in localStorage
    const bookingData = {
      kosId: kos.id,
      kosName: kos.name,
      price: kos.pricePerMonth,
      address: kos.address,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    setLocation('/payment');
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Navigation className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-gray-600">Mencari kos terdekat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-teal-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Kos Terdekat
            </h1>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Navigation className="w-4 h-4" />
              <span>Lokasi Anda: {locationName}</span>
            </div>
            {nearbyKos.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Ditemukan {nearbyKos.length} kos dalam radius 15km
              </p>
            )}
          </div>
        </div>

        {/* Kos List */}
        {nearbyKos.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Tidak ada kos terdekat
            </h3>
            <p className="text-gray-500">
              Coba perluas area pencarian atau periksa lokasi GPS Anda
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {nearbyKos.map((kos) => (
              <Card key={kos.id} className="hover:shadow-lg transition-shadow duration-200">
                <div className="relative">
                  <img
                    src={kos.images[0] || "/placeholder-kos.jpg"}
                    alt={kos.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-white text-gray-700">
                      {kos.distance}km
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant={kos.type === 'putra' ? 'default' : kos.type === 'putri' ? 'secondary' : 'outline'}
                      className="capitalize"
                    >
                      {kos.type}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-1">{kos.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{kos.address}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {kos.description}
                  </p>
                  
                  {/* Rating and Reviews */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{kos.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({kos.reviewCount} review)
                    </span>
                  </div>
                  
                  {/* Facilities */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {kos.facilities.slice(0, 3).map((facility, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {facility === 'WiFi' && <Wifi className="w-3 h-3 mr-1" />}
                        {facility === 'Parkir' && <Car className="w-3 h-3 mr-1" />}
                        {facility}
                      </Badge>
                    ))}
                    {kos.facilities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{kos.facilities.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Available Rooms */}
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {kos.availableRooms > 0 
                        ? `${kos.availableRooms} kamar tersedia`
                        : 'Kamar penuh'
                      }
                    </span>
                  </div>
                  
                  {/* Price and Book Button */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-teal-600">
                        {formatPrice(kos.pricePerMonth)}
                      </p>
                      <p className="text-xs text-gray-500">/bulan</p>
                    </div>
                    
                    <Button
                      onClick={() => handleBook(kos)}
                      disabled={kos.availableRooms === 0}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      {kos.availableRooms > 0 ? 'Book Sekarang' : 'Kamar Penuh'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => setLocation('/')}
            className="px-6"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}