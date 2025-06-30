import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Mail, Book, Video, Download, Users, Clock, Shield } from "lucide-react";

export default function DukunganPage() {
  const supportCategories = [
    {
      icon: Book,
      title: "Panduan Lengkap",
      description: "Dokumentasi dan tutorial step-by-step",
      items: [
        "Cara mencari kos dengan GPS",
        "Panduan booking dan pembayaran", 
        "Tutorial mendaftarkan kos",
        "Manajemen dashboard pemilik"
      ],
      action: "Baca Panduan",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Video,
      title: "Video Tutorial",
      description: "Tutorial visual untuk memudahkan pembelajaran",
      items: [
        "Demo pencarian lokasi terdekat",
        "Cara menggunakan fitur GPS",
        "Tutorial upload foto kos",
        "Manajemen pembayaran"
      ],
      action: "Tonton Video",
      color: "bg-red-100 text-red-600"
    },
    {
      icon: Download,
      title: "Resource Download",
      description: "Unduh panduan dan template untuk kemudahan",
      items: [
        "Template deskripsi kos menarik",
        "Checklist foto kos berkualitas",
        "Panduan harga kompetitif",
        "Form kontrak sewa"
      ],
      action: "Download",
      color: "bg-green-100 text-green-600"
    }
  ];

  const supportTeam = [
    {
      icon: MessageCircle,
      title: "Live Chat Support",
      description: "Bantuan real-time melalui WhatsApp",
      availability: "24/7 Online",
      response: "Respon dalam 5 menit",
      action: () => window.open('https://wa.me/6289663596711', '_blank'),
      buttonText: "Chat Sekarang",
      buttonClass: "bg-green-600 hover:bg-green-700"
    },
    {
      icon: Phone,
      title: "Telepon Support",
      description: "Bantuan langsung via telepon",
      availability: "08:00 - 22:00 WIB",
      response: "Langsung terhubung",
      action: () => window.open('tel:+6289663596711'),
      buttonText: "Telepon",
      buttonClass: "bg-blue-600 hover:bg-blue-700"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Untuk pertanyaan detail dan kompleks",
      availability: "24/7 Available",
      response: "Respon 1-24 jam",
      action: () => window.open('mailto:support@sipalingkost.com'),
      buttonText: "Kirim Email",
      buttonClass: "bg-teal-600 hover:bg-teal-700"
    }
  ];

  const quickFixes = [
    {
      problem: "GPS tidak dapat diakses",
      solution: "Aktifkan location services di browser dan izinkan akses lokasi"
    },
    {
      problem: "Foto kos tidak ter-upload",
      solution: "Pastikan ukuran file < 5MB dan format JPG/PNG"
    },
    {
      problem: "Tidak menerima notifikasi WhatsApp",
      solution: "Periksa nomor WhatsApp dan pastikan aktif"
    },
    {
      problem: "Pembayaran gagal diproses",
      solution: "Cek saldo dan koneksi internet, atau hubungi bank"
    }
  ];

  const communityFeatures = [
    {
      icon: Users,
      title: "Forum Komunitas",
      description: "Bergabung dengan komunitas pemilik dan pencari kos",
      stats: "500+ Anggota Aktif"
    },
    {
      icon: Clock,
      title: "Response Time",
      description: "Jaminan waktu respon cepat untuk semua pertanyaan",
      stats: "< 5 Menit (WhatsApp)"
    },
    {
      icon: Shield,
      title: "Garansi Layanan",
      description: "Kepuasan pelanggan adalah prioritas utama kami",
      stats: "99.5% Satisfaction Rate"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Pusat Dukungan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Tim support SI PALING KOST siap membantu Anda kapan saja. 
            Temukan jawaban, panduan, dan bantuan langsung di sini.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => window.open('https://wa.me/6289663596711', '_blank')}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat WhatsApp
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('support-team')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Lihat Semua Opsi
            </Button>
          </div>
        </div>
      </section>

      {/* Support Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sumber Belajar
            </h2>
            <p className="text-gray-600">
              Pelajari cara menggunakan platform dengan optimal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center">
                    <div className={`mx-auto w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="text-sm text-gray-600 space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" variant="outline">
                      {category.action}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Fixes */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Solusi Cepat
            </h2>
            <p className="text-gray-600">
              Masalah umum dan cara mengatasinya
            </p>
          </div>

          <div className="space-y-4">
            {quickFixes.map((fix, index) => (
              <Card key={index} className="border-l-4 border-l-teal-600">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        ❓ {fix.problem}
                      </h3>
                      <p className="text-gray-600">
                        ✅ {fix.solution}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Butuh Bantuan?
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Support Team */}
      <section id="support-team" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tim Support Kami
            </h2>
            <p className="text-gray-600">
              Berbagai cara untuk mendapatkan bantuan langsung
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportTeam.map((support, index) => {
              const IconComponent = support.icon;
              return (
                <Card key={index} className="border-0 shadow-lg text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-gray-600" />
                    </div>
                    <CardTitle className="text-xl">{support.title}</CardTitle>
                    <CardDescription>{support.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p><strong>Ketersediaan:</strong> {support.availability}</p>
                      <p><strong>Response Time:</strong> {support.response}</p>
                    </div>
                    <Button 
                      onClick={support.action}
                      className={`w-full ${support.buttonClass}`}
                    >
                      {support.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Mengapa Memilih Support Kami?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {communityFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-teal-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-teal-600">
                      {feature.stats}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Emergency Support */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-teal-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Bantuan Darurat 24/7
          </h2>
          <p className="text-xl mb-8 text-teal-100">
            Untuk masalah mendesak atau darurat, tim kami siap membantu kapan saja
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => window.open('https://wa.me/6289663596711', '_blank')}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp Darurat
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-teal-600"
              onClick={() => window.open('tel:+6289663596711')}
            >
              <Phone className="w-5 h-5 mr-2" />
              Hotline 24/7
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}