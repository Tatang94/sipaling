import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Smartphone, Headphones } from "lucide-react";

export default function PromotionalSection() {
  const features = [
    {
      icon: TrendingUp,
      title: "Tingkatkan Okupansi",
      description: "Rata-rata 95% tingkat hunian"
    },
    {
      icon: Shield,
      title: "Sistem Aman",
      description: "Verifikasi penyewa otomatis"
    },
    {
      icon: Smartphone,
      title: "Manajemen Mudah",
      description: "Dashboard lengkap di genggaman"
    },
    {
      icon: Headphones,
      title: "Support 24/7",
      description: "Tim customer service siap membantu"
    }
  ];

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-r from-primary to-green-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Punya Kos? Daftarkan Sekarang!
            </h2>
            <p className="text-xl mb-8 text-green-100">
              Bergabunglah dengan ribuan pemilik kos yang sudah mempercayakan properti mereka kepada kami. 
              Dapatkan penghasilan maksimal dengan sistem manajemen yang mudah.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center">
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                      <Icon className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{feature.title}</h4>
                      <p className="text-sm text-green-100">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <Button className="bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Daftarkan Kos Anda
            </Button>
          </div>
          
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
              alt="Pemilik kos bahagia mengelola properti"
              className="rounded-xl shadow-2xl"
            />
            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">2,847</div>
                <div className="text-sm text-gray-600">Kos Terdaftar</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
