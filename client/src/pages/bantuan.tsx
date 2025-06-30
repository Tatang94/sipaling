import { useState } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Phone, Mail, Search, MapPin, Home, CreditCard, Shield, HelpCircle, Book, ChevronDown, ChevronUp } from "lucide-react";

export default function BantuanPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openCategory, setOpenCategory] = useState<number | null>(null);

  const categories = [
    {
      icon: Search,
      title: "Cara Pencarian",
      description: "Tips mencari kos yang tepat",
      color: "bg-blue-100 text-blue-600",
      content: [
        {
          question: "Bagaimana cara mencari kos terdekat dengan GPS?",
          answer: "1. Buka halaman 'Cari Lokasi'\n2. Klik 'Izinkan Akses Lokasi' saat browser meminta\n3. Tunggu hingga lokasi Anda terdeteksi\n4. Sistem akan menampilkan kos-kos terdekat berdasarkan jarak\n5. Klik kos yang diminati untuk melihat detail"
        },
        {
          question: "Apa saja filter yang bisa digunakan?",
          answer: "Anda dapat memfilter berdasarkan:\n• Harga (rentang bulanan)\n• Tipe kos (putra, putri, campur)\n• Fasilitas (WiFi, AC, parkir, dll)\n• Jarak dari lokasi Anda\n• Rating dan review penyewa"
        },
        {
          question: "Bagaimana cara membaca review yang akurat?",
          answer: "Tips membaca review:\n• Baca review terbaru (3-6 bulan terakhir)\n• Perhatikan review dengan foto\n• Fokus pada aspek yang penting bagi Anda\n• Cari pola keluhan yang berulang\n• Pertimbangkan rating keseluruhan"
        },
        {
          question: "Bagaimana menentukan lokasi yang strategis?",
          answer: "Kriteria lokasi strategis:\n• Dekat kampus/tempat kerja (< 5km)\n• Akses transportasi umum\n• Tersedia warung makan dan minimarket\n• Keamanan lingkungan 24 jam\n• Sinyal internet yang kuat"
        }
      ]
    },
    {
      icon: Home,
      title: "Informasi Kos",
      description: "Memahami detail dan fasilitas",
      color: "bg-green-100 text-green-600",
      content: [
        {
          question: "Apa perbedaan kos putra, putri, dan campur?",
          answer: "• Kos Putra: Khusus laki-laki, biasanya lebih fleksibel dengan aturan\n• Kos Putri: Khusus perempuan, aturan lebih ketat untuk keamanan\n• Kos Campur: Laki-laki dan perempuan, dengan pembagian lantai/area"
        },
        {
          question: "Fasilitas apa saja yang penting?",
          answer: "Fasilitas Wajib:\n• Kamar mandi dalam/luar\n• Listrik dan air bersih\n• Keamanan (CCTV/satpam)\n\nFasilitas Tambahan:\n• WiFi gratis\n• AC atau kipas angin\n• Dapur bersama\n• Parkir motor/mobil\n• Laundry"
        },
        {
          question: "Aturan kos yang umum berlaku?",
          answer: "Aturan Umum:\n• Jam malam (biasanya 22:00-23:00)\n• Larangan tamu menginap\n• Menjaga kebersihan kamar dan area umum\n• Tidak boleh memasak di kamar\n• Pembayaran tepat waktu\n• Tidak membawa hewan peliharaan"
        },
        {
          question: "Cara berkomunikasi dengan pemilik kos?",
          answer: "Tips Komunikasi:\n• Gunakan bahasa yang sopan dan formal\n• Tanyakan hal-hal penting di awal\n• Minta nomor WhatsApp untuk komunikasi cepat\n• Klarifikasi aturan dan biaya tambahan\n• Minta kontrak atau surat perjanjian"
        }
      ]
    },
    {
      icon: CreditCard,
      title: "Pembayaran",
      description: "Proses booking dan pembayaran",
      color: "bg-purple-100 text-purple-600",
      content: [
        {
          question: "Bagaimana cara booking kos online?",
          answer: "Langkah Booking:\n1. Pilih kos yang diinginkan\n2. Klik foto kos untuk melihat detail\n3. Sistem akan redirect ke halaman pembayaran\n4. Isi data pribadi dengan lengkap\n5. Pilih metode pembayaran\n6. Upload bukti pembayaran\n7. Tunggu konfirmasi dari pemilik"
        },
        {
          question: "Metode pembayaran apa saja yang tersedia?",
          answer: "Metode Pembayaran:\n• Transfer Bank: BCA, BNI, BRI, Mandiri\n• E-Wallet: GoPay, OVO, DANA, ShopeePay\n• Virtual Account (VA)\n• QRIS untuk pembayaran instant\n\nSemua transaksi aman dan terenkripsi."
        },
        {
          question: "Bagaimana cara upload bukti pembayaran?",
          answer: "Cara Upload Bukti:\n1. Foto/screenshot bukti transfer yang jelas\n2. Pastikan terlihat: nominal, tanggal, nama penerima\n3. Format file: JPG, PNG (max 5MB)\n4. Upload melalui halaman pembayaran\n5. Akan ada notifikasi WhatsApp untuk konfirmasi"
        },
        {
          question: "Bagaimana kebijakan refund?",
          answer: "Kebijakan Refund:\n• Refund 100% jika dibatalkan dalam 24 jam\n• Refund 50% jika dibatalkan 2-7 hari\n• Tidak ada refund setelah 7 hari\n• Proses refund maksimal 7 hari kerja\n• Biaya admin bank tidak dikembalikan"
        }
      ]
    },
    {
      icon: Shield,
      title: "Keamanan",
      description: "Tips aman dalam booking kos",
      color: "bg-red-100 text-red-600",
      content: [
        {
          question: "Bagaimana verifikasi pemilik kos yang legitimate?",
          answer: "Cara Verifikasi:\n• Cek nomor WhatsApp terdaftar dengan nama yang sama\n• Minta foto KTP pemilik untuk verifikasi\n• Video call untuk memastikan identitas\n• Cek review dari penyewa sebelumnya\n• Pastikan alamat kos sesuai dengan GPS"
        },
        {
          question: "Tips survey kos sebelum booking?",
          answer: "Checklist Survey:\n• Datang langsung ke lokasi kos\n• Cek kondisi kamar dan fasilitas\n• Tanya tetangga sekitar tentang lingkungan\n• Tes kualitas internet dan sinyal\n• Cek keamanan (CCTV, pagar, lighting)\n• Pastikan akses transportasi umum"
        },
        {
          question: "Bagaimana menghindari penipuan online?",
          answer: "Red Flags Penipuan:\n• Harga terlalu murah dibanding market\n• Minta pembayaran full di muka\n• Tidak bisa dihubungi via telepon\n• Tidak ada foto asli kos\n• Lokasi GPS tidak akurat\n• Tidak mau ketemu langsung\n• Tidak ada kontrak tertulis"
        },
        {
          question: "Tips menjaga keamanan data pribadi?",
          answer: "Keamanan Data:\n• Jangan share KTP/dokumen ke sembarang orang\n• Gunakan password yang kuat\n• Logout setelah selesai menggunakan platform\n• Jangan simpan data pembayaran di browser publik\n• Laporkan aktivitas mencurigakan ke admin\n• Selalu verifikasi identitas penerima transfer"
        }
      ]
    }
  ];

  const toggleCategory = (index: number) => {
    setOpenCategory(openCategory === index ? null : index);
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    content: category.content.filter(item => 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.content.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50 to-blue-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Pusat Bantuan
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Temukan jawaban untuk semua pertanyaan Anda tentang cara menggunakan SI PALING KOST. 
            Dari pencarian kos hingga tips keamanan.
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Cari bantuan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3"
            />
          </div>
        </div>
      </section>

      {/* Categories Overview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Kategori Bantuan
            </h2>
            <p className="text-gray-600">
              Pilih kategori yang sesuai dengan pertanyaan Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card 
                  key={index} 
                  className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => toggleCategory(index)}
                >
                  <CardHeader className="text-center">
                    <div className={`mx-auto w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex items-center justify-center text-teal-600">
                      {openCategory === index ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detailed Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada hasil yang ditemukan untuk "{searchTerm}"</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredCategories.map((category, categoryIndex) => {
                const IconComponent = category.icon;
                const isOpen = openCategory === categoryIndex || searchTerm !== "";
                
                if (!isOpen && searchTerm === "") return null;
                
                return (
                  <div key={categoryIndex}>
                    <div className="flex items-center mb-6">
                      <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center mr-4`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {category.title}
                        </h2>
                        <p className="text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {category.content.map((item, itemIndex) => (
                        <Card key={itemIndex} className="border border-gray-200 shadow-sm">
                          <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-900 text-left">
                              {item.question}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                              {item.answer}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-teal-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Masih Butuh Bantuan?
          </h2>
          <p className="text-xl mb-8 text-teal-100">
            Tim customer service kami siap membantu Anda 24/7
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => window.open('https://wa.me/6289663596711', '_blank')}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat WhatsApp
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-teal-600"
              onClick={() => window.open('tel:+6289663596711')}
            >
              <Phone className="w-5 h-5 mr-2" />
              Telepon Support
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}