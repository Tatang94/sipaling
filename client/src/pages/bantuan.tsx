import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Mail, Phone, Clock, MapPin, Search, Home, CreditCard, Shield } from "lucide-react";

export default function BantuanPage() {
  const faqs = [
    {
      question: "Bagaimana cara mencari kos di SI PALING KOST?",
      answer: "Anda bisa menggunakan fitur pencarian di halaman utama. Masukkan lokasi yang diinginkan, pilih rentang harga, dan tipe kos (putra/putri/campur). Sistem akan menampilkan daftar kos yang sesuai dengan kriteria Anda."
    },
    {
      question: "Apakah semua informasi kos yang ditampilkan akurat?",
      answer: "Ya, semua informasi kos telah diverifikasi oleh tim kami. Namun, kami sarankan untuk melakukan komunikasi langsung dengan pemilik kos untuk memastikan ketersediaan dan detail terbaru sebelum membuat keputusan."
    },
    {
      question: "Bagaimana cara booking kos?",
      answer: "Setelah menemukan kos yang sesuai, klik tombol 'Book Now' pada kartu kos. Sistem akan menampilkan informasi kontak pemilik kos. Anda bisa menghubungi pemilik langsung melalui WhatsApp atau telepon untuk proses booking."
    },
    {
      question: "Apakah ada biaya untuk menggunakan layanan SI PALING KOST?",
      answer: "Tidak, layanan pencarian kos di SI PALING KOST sepenuhnya gratis untuk pengguna. Kami tidak mengenakan biaya apapun untuk pencarian dan kontak dengan pemilik kos."
    },
    {
      question: "Bagaimana jika kos yang saya book ternyata sudah penuh?",
      answer: "Kami selalu update ketersediaan kamar secara berkala. Namun jika terjadi ketidakcocokan, Anda bisa mencari alternatif kos lain atau menghubungi customer service kami untuk bantuan pencarian kos serupa."
    },
    {
      question: "Apakah bisa melihat kos secara virtual?",
      answer: "Ya, sebagian besar kos di platform kami menyediakan galeri foto lengkap. Beberapa kos premium juga menyediakan virtual tour. Anda juga bisa meminta video call dengan pemilik kos sebelum memutuskan."
    },
    {
      question: "Bagaimana sistem pembayaran di SI PALING KOST?",
      answer: "SI PALING KOST tidak memproses pembayaran. Semua transaksi pembayaran dilakukan langsung antara Anda dan pemilik kos. Kami hanya menyediakan platform untuk bertemu dan berkomunikasi."
    },
    {
      question: "Apakah ada garansi jika kos tidak sesuai dengan deskripsi?",
      answer: "Kami memiliki sistem rating dan review dari penghuni sebelumnya. Jika Anda menemukan ketidaksesuaian, silakan laporkan ke customer service kami agar kami bisa tindak lanjuti dengan pemilik kos."
    }
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Chat langsung dengan tim support",
      contact: "+62 812 3456 7890",
      available: "24/7"
    },
    {
      icon: Mail,
      title: "Email",
      description: "Kirim pertanyaan detail",
      contact: "support@sipalingkost.com",
      available: "Respon dalam 24 jam"
    },
    {
      icon: Phone,
      title: "Telepon",
      description: "Bicara langsung dengan customer service",
      contact: "+62 21 1234 5678",
      available: "Sen-Jum 08:00-17:00"
    }
  ];

  const helpCategories = [
    {
      icon: Search,
      title: "Cara Pencarian",
      description: "Tips mencari kos yang tepat",
      color: "bg-blue-500"
    },
    {
      icon: Home,
      title: "Informasi Kos",
      description: "Memahami detail dan fasilitas",
      color: "bg-green-500"
    },
    {
      icon: CreditCard,
      title: "Pembayaran",
      description: "Proses booking dan pembayaran",
      color: "bg-purple-500"
    },
    {
      icon: Shield,
      title: "Keamanan",
      description: "Tips aman dalam booking kos",
      color: "bg-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-green-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pusat Bantuan SI PALING KOST
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Temukan jawaban atas pertanyaan Anda atau hubungi tim support kami
          </p>
          
          {/* Search Help */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Cari bantuan..."
                className="pl-10 bg-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Help Categories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Kategori Bantuan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{category.title}</h3>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-medium text-gray-900">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Masih Butuh Bantuan?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tim customer service kami siap membantu Anda 24/7. Pilih metode komunikasi yang paling nyaman untuk Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{method.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                    <p className="font-medium text-primary mb-2">{method.contact}</p>
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {method.available}
                    </div>
                    <Button className="mt-4 bg-primary hover:bg-primary/90">
                      Hubungi Sekarang
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Contact Form */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Kirim Pesan Langsung</CardTitle>
              <CardDescription>
                Isi formulir di bawah ini dan tim kami akan merespon dalam 24 jam
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <Input placeholder="Masukkan nama lengkap" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input type="email" placeholder="nama@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjek
                </label>
                <Input placeholder="Subjek pertanyaan Anda" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesan
                </label>
                <Textarea 
                  placeholder="Jelaskan pertanyaan atau masalah Anda dengan detail..."
                  rows={5}
                />
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                Kirim Pesan
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Office Location */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Kantor Kami
            </h2>
            <p className="text-gray-600">
              Kunjungi kantor kami untuk konsultasi langsung
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Kantor Pusat SI PALING KOST</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 text-primary mr-3 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">Alamat</p>
                          <p className="text-gray-600">
                            Jl. Sudirman No. 123, Lantai 15<br />
                            Jakarta Pusat 10220, Indonesia
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-5 h-5 text-primary mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Telepon</p>
                          <p className="text-gray-600">+62 21 1234 5678</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-primary mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Jam Operasional</p>
                          <p className="text-gray-600">
                            Senin - Jumat: 08:00 - 17:00 WIB<br />
                            Sabtu: 08:00 - 12:00 WIB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-3" />
                      <p className="text-sm">Peta lokasi kantor</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}