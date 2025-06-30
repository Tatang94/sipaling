import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Download, Image, RefreshCw, Camera, CheckCircle, AlertCircle } from "lucide-react";

interface ScrapeStatus {
  stats: {
    total: number;
    withImages: number;
    withoutImages: number;
  };
  kosWithoutImages: Array<{
    id: number;
    name: string;
    city: string;
  }>;
}

export default function AdminScraper() {
  const [isScrapingAll, setIsScrapingAll] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [selectedKos, setSelectedKos] = useState("");
  const [selectedCity, setSelectedCity] = useState("tasikmalaya");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get scraping status
  const { data: status, isLoading, refetch } = useQuery<ScrapeStatus>({
    queryKey: ["/api/scrape/status"],
  });

  // Single kos scraping mutation
  const scrapeSingleMutation = useMutation({
    mutationFn: async ({ kosName, city }: { kosName: string; city: string }) => {
      const response = await fetch("/api/scrape/kos-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kosName, city }),
      });
      if (!response.ok) throw new Error("Scraping failed");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Scraping Berhasil!",
        description: `Berhasil mengunduh ${data.count} foto untuk ${data.kosName}`,
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/kos"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Scraping Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Batch scraping mutation
  const scrapeAllMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/scrape/all-kos-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Batch scraping failed");
      return response.json();
    },
    onSuccess: (data) => {
      setIsScrapingAll(false);
      setScrapingProgress(100);
      toast({
        title: "Batch Scraping Selesai!",
        description: `Berhasil update ${data.updatedKos} dari ${data.totalKos} kos`,
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/kos"] });
    },
    onError: (error: Error) => {
      setIsScrapingAll(false);
      setScrapingProgress(0);
      toast({
        title: "Batch Scraping Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleScrapeAll = async () => {
    setIsScrapingAll(true);
    setScrapingProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setScrapingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 1000);

    scrapeAllMutation.mutate();
  };

  const handleScrapeKos = async (kosId: number, kosName: string, city: string) => {
    const response = await fetch(`/api/kos/${kosId}/scrape-images`, {
      method: "PATCH",
    });
    
    if (response.ok) {
      const data = await response.json();
      toast({
        title: "Scraping Berhasil!",
        description: `Berhasil mengunduh ${data.count} foto untuk ${kosName}`,
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/kos"] });
    } else {
      toast({
        title: "Scraping Gagal",
        description: `Gagal mengunduh foto untuk ${kosName}`,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Scraper Foto Kos</h1>
        <p className="text-muted-foreground">
          Kelola dan unduh foto asli kos dari sumber terpercaya
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kos</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.stats.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dengan Foto</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {status?.stats.withImages || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tanpa Foto</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {status?.stats.withoutImages || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Scraping */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Scrape Semua Foto Kos
          </CardTitle>
          <CardDescription>
            Unduh foto untuk semua kos yang belum memiliki foto secara otomatis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isScrapingAll && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(scrapingProgress)}%</span>
              </div>
              <Progress value={scrapingProgress} className="w-full" />
            </div>
          )}
          
          <Button 
            onClick={handleScrapeAll}
            disabled={isScrapingAll || scrapeAllMutation.isPending}
            className="w-full"
          >
            {isScrapingAll ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sedang Mengunduh Foto...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Scrape Semua Foto ({status?.stats.withoutImages || 0} kos)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Manual Single Scraping */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scrape Foto Kos Tertentu
          </CardTitle>
          <CardDescription>
            Unduh foto untuk kos tertentu secara manual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kosName">Nama Kos</Label>
              <Input
                id="kosName"
                value={selectedKos}
                onChange={(e) => setSelectedKos(e.target.value)}
                placeholder="Contoh: Kost H. Dadang"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Kota</Label>
              <Input
                id="city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                placeholder="tasikmalaya"
              />
            </div>
          </div>
          
          <Button 
            onClick={() => scrapeSingleMutation.mutate({ kosName: selectedKos, city: selectedCity })}
            disabled={!selectedKos || scrapeSingleMutation.isPending}
            className="w-full"
          >
            {scrapeSingleMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Mengunduh...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Scrape Foto Kos
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Kos Without Images */}
      {status?.kosWithoutImages && status.kosWithoutImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kos Tanpa Foto ({status.kosWithoutImages.length})</CardTitle>
            <CardDescription>
              Klik untuk mengunduh foto kos tertentu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {status.kosWithoutImages.map((kos) => (
                <div 
                  key={kos.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{kos.name}</h4>
                    <p className="text-sm text-muted-foreground">{kos.city}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleScrapeKos(kos.id, kos.name, kos.city)}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
      </div>
    </div>
  );
}