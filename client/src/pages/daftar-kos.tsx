import { AddKosModal } from "@/components/add-kos-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, MapPin, Users, Shield, Star, TrendingUp } from "lucide-react";

export default function DaftarKosPage() {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Jangkauan Luas",
      description: "Kos Anda akan dilihat ribuan pencari kos di seluruh Indonesia"
    },
    {
      icon: MapPin,
      title: "Lokasi GPS Akurat",
      description: "Sistem GPS membantu pencari kos menemukan lokasi dengan mudah"
    },
    {
      icon: Users,
      title: "Manajemen Mudah",
      description: "Dashboard lengkap untuk mengelola kos, penyewa, dan pembayaran"
    },
    {
      icon: Shield,
      title: "Aman & Terpercaya",
      description: "Platform yang aman dengan sistem verifikasi dan perlindungan data"
    },
    {
      icon: Star,
      title: "Rating & Review",
      description: "Sistem rating membantu meningkatkan kepercayaan calon penyewa"
    },
    {
      icon: Home,
      title: "Gratis Daftar",
      description: "Tidak ada biaya pendaftaran, mulai promosikan kos Anda sekarang"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Isi Data Kos",
      description: "Lengkapi informasi kos seperti nama, alamat, fasilitas, dan foto"
    },
    {
      number: "2", 
      title: "Tentukan Lokasi GPS",
      description: "Aktifkan GPS untuk mendapatkan koordinat yang akurat"
    },
    {
      number: "3",
      title: "Upload Foto",
      description: "Tambahkan foto menarik untuk menarik minat pencari kos"
    },
    {
      number: "4",
      title: "Publikasi",
      description: "Kos Anda akan langsung tampil dan bisa dicari"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Daftarkan Kos Anda di
            <span className="text-teal-600 block mt-2">SI PALING KOST</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan pemilik kos yang telah mempercayakan properti mereka kepada kami. 
            Dapatkan penyewa berkualitas dengan mudah dan cepat.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <AddKosModal 
              trigger={
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg">
                  Daftar Kos Sekarang
                </Button>
              }
            />
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
              Lihat Contoh Listing
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Mengapa Memilih SI PALING KOST?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Platform terdepan untuk mengelola dan mempromosikan properti kos Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-teal-600" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-gray-600">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cara Mendaftarkan Kos
            </h2>
            <p className="text-gray-600">
              Proses mudah dan cepat, hanya butuh beberapa menit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto w-16 h-16 bg-teal-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <AddKosModal 
              trigger={
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3">
                  Mulai Daftarkan Kos
                </Button>
              }
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-teal-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Siap Meningkatkan Bisnis Kos Anda?
          </h2>
          <p className="text-xl mb-8 text-teal-100">
            Bergabunglah dengan komunitas pemilik kos sukses di seluruh Indonesia
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AddKosModal 
              trigger={
                <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                  Daftar Gratis Sekarang
                </Button>
              }
            />
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-white text-white hover:bg-white hover:text-teal-600">
              Hubungi Tim Kami
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}