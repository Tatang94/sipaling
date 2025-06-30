import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Users, MapPin, Shield, Heart, Target, Eye, Award } from "lucide-react";

export default function TentangPage() {
  const values = [
    {
      icon: Shield,
      title: "Kepercayaan",
      description: "Membangun platform yang aman dan terpercaya untuk semua pengguna"
    },
    {
      icon: Heart,
      title: "Kemudahan",
      description: "Menyediakan solusi yang mudah dan nyaman untuk mencari dan menyewakan kos"
    },
    {
      icon: Users,
      title: "Komunitas",
      description: "Membangun komunitas yang saling membantu antara pemilik dan pencari kos"
    },
    {
      icon: Award,
      title: "Kualitas",
      description: "Berkomitmen memberikan layanan berkualitas tinggi untuk kepuasan pengguna"
    }
  ];

  const team = [
    {
      name: "Tim Teknologi",
      role: "Pengembangan Platform",
      description: "Mengembangkan fitur-fitur inovatif untuk pengalaman pengguna terbaik"
    },
    {
      name: "Tim Operasional",
      role: "Layanan Pelanggan",
      description: "Memastikan layanan pelanggan yang responsif dan memuaskan"
    },
    {
      name: "Tim Marketing",
      role: "Promosi & Kemitraan",
      description: "Mengembangkan kerjasama dan strategi untuk jangkauan yang lebih luas"
    }
  ];

  const achievements = [
    { number: "1000+", label: "Kos Terdaftar" },
    { number: "38", label: "Provinsi" },
    { number: "5000+", label: "Pengguna Aktif" },
    { number: "24/7", label: "Customer Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-teal-600 rounded-2xl flex items-center justify-center">
              <Home className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Tentang <span className="text-teal-600">SI PALING KOST</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Platform digital terdepan yang menghubungkan pencari kos dengan pemilik properti 
            di seluruh Indonesia. Kami berkomitmen memberikan solusi hunian yang aman, nyaman, dan terjangkau.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-teal-600" />
                </div>
                <CardTitle className="text-2xl text-teal-800">Misi Kami</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-700 text-base leading-relaxed">
                  Memudahkan proses pencarian dan penyewaan kos-kosan di Indonesia melalui 
                  teknologi digital yang inovatif, dengan mengutamakan keamanan, kenyamanan, 
                  dan kepuasan semua pihak yang terlibat.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-blue-800">Visi Kami</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-700 text-base leading-relaxed">
                  Menjadi platform terpercaya nomor satu di Indonesia untuk solusi hunian kos, 
                  yang menghubungkan jutaan pencari kos dengan ribuan pemilik properti 
                  di seluruh nusantara.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nilai-Nilai Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Prinsip-prinsip yang menjadi fondasi dalam setiap layanan yang kami berikan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pencapaian Kami
            </h2>
            <p className="text-gray-600">
              Angka-angka yang menunjukkan komitmen kami dalam melayani
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-teal-600 mb-2">
                  {achievement.number}
                </div>
                <div className="text-gray-700 font-medium">
                  {achievement.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tim Kami
            </h2>
            <p className="text-gray-600">
              Orang-orang terbaik yang bekerja untuk memberikan layanan terbaik
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-lg text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-teal-600 font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {member.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-teal-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <MapPin className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Jangkauan Nasional
          </h2>
          <p className="text-xl mb-8 text-teal-100">
            Melayani dari Sabang sampai Merauke, menghubungkan kos-kosan 
            di 38 provinsi di seluruh Indonesia
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="px-8 py-3">
              Cari Kos Terdekat
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3 border-white text-white hover:bg-white hover:text-teal-600">
              Daftarkan Kos
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}