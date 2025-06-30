import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Fix untuk ikon marker default Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  showKosLocations?: boolean;
  selectedKos?: any;
}

interface KosLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  price: number;
  type: string;
}

// Komponen untuk mengupdate center peta
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function LocationMap({ onLocationSelect, showKosLocations = false, selectedKos }: LocationMapProps) {
  const [position, setPosition] = useState<[number, number]>([-6.2088, 106.8456]); // Default Jakarta
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [kosLocations, setKosLocations] = useState<KosLocation[]>([]);
  const [loading, setLoading] = useState(false);

  // Dapatkan lokasi GPS user
  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newPosition: [number, number] = [lat, lng];
          setPosition(newPosition);
          setUserLocation(newPosition);
          
          // Reverse geocoding untuk mendapatkan alamat
          reverseGeocode(lat, lng);
          
          // Cari kos terdekat
          if (showKosLocations) {
            searchNearbyKos(lat, lng);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
          alert('Tidak dapat mengakses lokasi GPS. Pastikan GPS diaktifkan dan izinkan akses lokasi.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert('GPS tidak didukung oleh browser ini.');
      setLoading(false);
    }
  };

  // Reverse geocoding menggunakan Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      const address = data.display_name || `${lat}, ${lng}`;
      
      if (onLocationSelect) {
        onLocationSelect(lat, lng, address);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  // Cari lokasi berdasarkan query
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=id`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const newPosition: [number, number] = [lat, lng];
        setPosition(newPosition);
        
        if (onLocationSelect) {
          onLocationSelect(lat, lng, data[0].display_name);
        }
        
        // Cari kos terdekat di lokasi pencarian
        if (showKosLocations) {
          searchNearbyKos(lat, lng);
        }
      } else {
        alert('Lokasi tidak ditemukan. Coba dengan nama yang lebih spesifik.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Error saat mencari lokasi.');
    }
    setLoading(false);
  };

  // Cari kos terdekat dari database API
  const searchNearbyKos = async (lat: number, lng: number) => {
    try {
      // Fetch real kos data from database
      const response = await fetch('/api/kos/featured');
      const kosData = await response.json();
      
      if (kosData && Array.isArray(kosData)) {
        // Filter and calculate distance for nearby kos
        const nearbyKos = kosData
          .filter((kos: any) => kos.latitude && kos.longitude)
          .map((kos: any) => {
            const kosLat = parseFloat(kos.latitude);
            const kosLng = parseFloat(kos.longitude);
            const distance = calculateDistance(lat, lng, kosLat, kosLng);
            
            return {
              id: kos.id,
              name: kos.name,
              latitude: kosLat,
              longitude: kosLng,
              price: parseFloat(kos.pricePerMonth || '0'),
              type: kos.type,
              distance
            };
          })
          .filter((kos: any) => kos.distance <= 5) // Within 5km radius
          .sort((a: any, b: any) => a.distance - b.distance)
          .slice(0, 10); // Show top 10 nearest

        setKosLocations(nearbyKos);
      }
    } catch (error) {
      console.error('Error fetching nearby kos:', error);
    }
  };

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

  // Load kos terdekat saat pertama kali render jika showKosLocations true
  useEffect(() => {
    if (showKosLocations) {
      searchNearbyKos(position[0], position[1]);
    }
  }, [showKosLocations]);

  return (
    <div className="w-full h-full">
      {/* Kontrol pencarian dan GPS */}
      <div className="mb-4 space-y-2">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Cari lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
            className="flex-1"
          />
          <Button 
            onClick={searchLocation} 
            disabled={loading}
            size="sm"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button 
            onClick={getCurrentLocation} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <Navigation className="h-4 w-4" />
            {loading ? 'Mencari...' : 'GPS'}
          </Button>
        </div>
      </div>

      {/* Peta */}
      <div className="h-96 w-full rounded-lg overflow-hidden border">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <ChangeView center={position} zoom={13} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Marker lokasi user */}
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>
                <div className="text-center">
                  <MapPin className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                  <strong>Lokasi Anda</strong>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Marker lokasi yang dipilih/dicari */}
          <Marker position={position}>
            <Popup>
              <div className="text-center">
                <MapPin className="h-4 w-4 mx-auto mb-1 text-green-600" />
                <strong>Lokasi Dipilih</strong>
              </div>
            </Popup>
          </Marker>
          
          {/* Marker kos terdekat */}
          {showKosLocations && kosLocations.map((kos) => (
            <Marker 
              key={kos.id} 
              position={[kos.latitude, kos.longitude]}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-semibold text-sm">{kos.name}</h3>
                  <p className="text-xs text-gray-600">{kos.type}</p>
                  <p className="text-sm font-medium text-green-600">
                    Rp {kos.price.toLocaleString('id-ID')}/bulan
                  </p>
                  <Button 
                    size="sm" 
                    className="mt-2 w-full"
                    onClick={() => {
                      // Navigate to kos detail atau booking
                      alert(`Lihat detail ${kos.name}`);
                    }}
                  >
                    Lihat Detail
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {/* Info lokasi */}
      <div className="mt-2 text-sm text-gray-600">
        <p>📍 Koordinat: {position[0].toFixed(6)}, {position[1].toFixed(6)}</p>
        {showKosLocations && (
          <p>🏠 Ditemukan {kosLocations.length} kos terdekat</p>
        )}
      </div>
    </div>
  );
}