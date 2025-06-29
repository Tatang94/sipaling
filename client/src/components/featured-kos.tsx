import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import KosCard from "./kos-card";
import KosDetailModal from "./kos-detail-modal";
import { type Kos } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function FeaturedKos() {
  const [selectedKos, setSelectedKos] = useState<Kos | null>(null);
  const [filterType, setFilterType] = useState("semua");
  const { toast } = useToast();

  const { data: kosList, isLoading } = useQuery<Kos[]>({
    queryKey: ["/api/kos/featured"],
  });

  const filteredKos = kosList?.filter(kos => {
    if (filterType === "semua") return true;
    return kos.type === filterType;
  }) || [];

  const filterTabs = [
    { key: "semua", label: "Semua" },
    { key: "putra", label: "Putra" },
    { key: "putri", label: "Putri" },
    { key: "campur", label: "Campur" },
  ];

  const handleBook = (kos: Kos) => {
    toast({
      title: "Booking Process",
      description: `Menghubungi pemilik kos ${kos.name}. Silakan hubungi ${kos.ownerPhone}`,
    });
  };

  const handleViewDetails = (kos: Kos) => {
    setSelectedKos(kos);
  };

  if (isLoading) {
    return (
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Kos Rekomendasi
            </h2>
            <p className="text-gray-600">
              Pilihan terbaik dengan fasilitas lengkap dan lokasi strategis
            </p>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex space-x-4 mt-6 md:mt-0">
            {filterTabs.map((tab) => (
              <Button
                key={tab.key}
                variant={filterType === tab.key ? "default" : "secondary"}
                className={filterType === tab.key ? "bg-primary hover:bg-primary/90" : ""}
                onClick={() => setFilterType(tab.key)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Kos Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredKos.map((kos) => (
            <KosCard
              key={kos.id}
              kos={kos}
              onViewDetails={handleViewDetails}
              onBook={handleBook}
            />
          ))}
        </div>

        {filteredKos.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada kos yang ditemukan untuk filter ini.</p>
          </div>
        )}

        {/* Load More Button */}
        {filteredKos.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Lihat Lebih Banyak
            </Button>
          </div>
        )}

        {/* Kos Detail Modal */}
        <KosDetailModal
          kos={selectedKos}
          isOpen={!!selectedKos}
          onClose={() => setSelectedKos(null)}
          onBook={handleBook}
        />
      </div>
    </section>
  );
}
