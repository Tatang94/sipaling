import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, DollarSign, Search } from "lucide-react";

export default function HeroSection() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCity) params.set("city", selectedCity);
    if (priceRange) params.set("price", priceRange);
    
    setLocation(`/search?${params.toString()}`);
  };

  return (
    <section className="bg-gradient-to-br from-green-50 to-white py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Temukan Kos Impian Anda
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Platform terpercaya untuk mencari kos-kosan berkualitas di seluruh Indonesia. 
            Lengkap dengan fasilitas modern dan harga terjangkau.
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white p-4 rounded-2xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Kota atau lokasi"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                    <SelectValue placeholder="Rentang harga" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500000-1000000">Rp 500.000 - Rp 1.000.000</SelectItem>
                    <SelectItem value="1000000-2000000">Rp 1.000.000 - Rp 2.000.000</SelectItem>
                    <SelectItem value="2000000-3000000">Rp 2.000.000 - Rp 3.000.000</SelectItem>
                    <SelectItem value="3000000-">Rp 3.000.000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleSearch}
                  className="bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center flex-1"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Cari Kos
                </Button>
                <Button 
                  onClick={() => setLocation('/cari-lokasi')}
                  variant="outline"
                  className="py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Lokasi
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
