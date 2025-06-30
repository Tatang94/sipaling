import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Search, MessageCircle, Phone, Mail } from "lucide-react";

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const faqData = [
    {
      category: "Umum",
      questions: [
        {
          question: "Apa itu SI PALING KOST?",
          answer: "SI PALING KOST adalah platform digital yang menghubungkan pencari kos dengan pemilik properti di seluruh Indonesia. Kami menyediakan layanan pencarian kos berdasarkan lokasi GPS, manajemen pembayaran, dan sistem komunikasi terintegrasi."
        },
        {
          question: "Apakah gratis menggunakan SI PALING KOST?",
          answer: "Ya, pendaftaran dan pencarian kos di platform kami sepenuhnya gratis. Untuk pemilik kos, pendaftaran properti juga gratis. Kami hanya mengenakan biaya untuk fitur premium tertentu."
        },
        {
          question: "Di mana saja SI PALING KOST tersedia?",
          answer: "SI PALING KOST melayani seluruh Indonesia, dari Sabang sampai Merauke. Kami memiliki jaringan di 38 provinsi dengan fokus pada kota-kota besar dan daerah kampus."
        }
      ]
    },
    {
      category: "Untuk Pencari Kos",
      questions: [
        {
          question: "Bagaimana cara mencari kos terdekat?",
          answer: "Gunakan fitur GPS kami di halaman 'Cari Lokasi'. Izinkan akses lokasi, dan sistem akan menampilkan kos-kos terdekat dari posisi Anda beserta jarak dan petunjuk arah."
        },
        {
          question: "Bagaimana cara booking kos?",
          answer: "Klik foto kos yang diminati, lalu pilih 'Book Now'. Anda akan diarahkan ke halaman pembayaran untuk mengisi data dan melakukan pembayaran sesuai ketentuan."
        },
        {
          question: "Metode pembayaran apa saja yang tersedia?",
          answer: "Kami menerima berbagai metode pembayaran: Transfer Bank (BCA, BNI, BRI, Mandiri), E-wallet (GoPay, OVO, DANA), dan Virtual Account. Semua transaksi aman dan terenkripsi."
        },
        {
          question: "Bagaimana jika kos sudah penuh?",
          answer: "Jika kos sudah penuh, Anda bisa menggunakan fitur 'Notifikasi' untuk mendapat pemberitahuan ketika ada kamar kosong. Atau cari alternatif kos terdekat lainnya."
        }
      ]
    },
    {
      category: "Untuk Pemilik Kos",
      questions: [
        {
          question: "Bagaimana cara mendaftarkan kos?",
          answer: "Klik 'Daftarkan Kos' di menu utama, isi form lengkap dengan data kos, aktifkan GPS untuk lokasi yang akurat, upload foto menarik, dan publikasikan. Kos Anda akan langsung bisa dicari."
        },
        {
          question: "Mengapa GPS penting untuk kos saya?",
          answer: "GPS memungkinkan pencari kos menemukan lokasi Anda dengan mudah dan akurat. Sistem kami mengurutkan hasil pencarian berdasarkan kedekatan lokasi, sehingga GPS yang akurat akan meningkatkan visibilitas kos Anda."
        },
        {
          question: "Bagaimana cara mengelola pembayaran penyewa?",
          answer: "Gunakan dashboard pemilik untuk memantau status pembayaran, mengirim reminder, dan melihat riwayat transaksi. Sistem akan otomatis memberikan notifikasi untuk pembayaran yang jatuh tempo."
        },
        {
          question: "Bisakah mengubah data kos setelah didaftarkan?",
          answer: "Ya, Anda bisa mengubah informasi kos kapan saja melalui dashboard. Perubahan akan langsung terlihat oleh pencari kos setelah disimpan."
        }
      ]
    },
    {
      category: "Pembayaran & Keamanan",
      questions: [
        {
          question: "Apakah transaksi pembayaran aman?",
          answer: "Sangat aman. Kami menggunakan enkripsi SSL dan bekerja sama dengan payment gateway terpercaya. Data finansial Anda tidak disimpan di server kami."
        },
        {
          question: "Bagaimana jika ada masalah dengan pembayaran?",
          answer: "Hubungi customer service kami melalui WhatsApp atau telepon. Tim kami siap membantu menyelesaikan masalah pembayaran 24/7."
        },
        {
          question: "Apakah ada jaminan keamanan untuk penyewa?",
          answer: "Kami memiliki sistem verifikasi pemilik kos dan rating/review untuk membantu penyewa membuat keputusan. Namun, kami sarankan untuk selalu melakukan survei lokasi sebelum memutuskan."
        }
      ]
    },
    {
      category: "Teknis",
      questions: [
        {
          question: "Kenapa GPS tidak bisa diakses?",
          answer: "Pastikan Anda mengizinkan akses lokasi di browser dan GPS ponsel sudah aktif. Jika masih bermasalah, coba refresh halaman atau gunakan browser lain."
        },
        {
          question: "Aplikasi mobile tersedia?",
          answer: "Saat ini kami fokus pada website yang mobile-friendly. Aplikasi mobile sedang dalam tahap pengembangan dan akan segera diluncurkan."
        },
        {
          question: "Bagaimana cara menghubungi customer service?",
          answer: "Anda bisa menghubungi kami melalui WhatsApp di +6289663596711, telepon, atau email. Tim customer service kami siap membantu 24/7."
        }
      ]
    }
  ];

  const toggleItem = (categoryIndex: number, questionIndex: number) => {
    const itemId = categoryIndex * 100 + questionIndex;
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Temukan jawaban untuk pertanyaan yang sering diajukan tentang SI PALING KOST
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Cari pertanyaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {filteredFAQ.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada hasil yang ditemukan untuk "{searchTerm}"</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredFAQ.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h2 className="text-2xl font-bold text-teal-800 mb-6">
                    {category.category}
                  </h2>
                  <div className="space-y-4">
                    {category.questions.map((item, questionIndex) => {
                      const itemId = categoryIndex * 100 + questionIndex;
                      const isOpen = openItems.includes(itemId);
                      
                      return (
                        <Card key={questionIndex} className="border border-gray-200 shadow-sm">
                          <CardHeader 
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleItem(categoryIndex, questionIndex)}
                          >
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg font-semibold text-gray-900 text-left">
                                {item.question}
                              </CardTitle>
                              {isOpen ? (
                                <ChevronUp className="w-5 h-5 text-teal-600 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-teal-600 flex-shrink-0" />
                              )}
                            </div>
                          </CardHeader>
                          
                          {isOpen && (
                            <CardContent className="pt-0">
                              <CardDescription className="text-gray-700 leading-relaxed">
                                {item.answer}
                              </CardDescription>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Masih Ada Pertanyaan?
          </h2>
          <p className="text-gray-600 mb-8">
            Tim customer service kami siap membantu Anda 24/7
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>WhatsApp</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => window.open('https://wa.me/6289663596711', '_blank')}
                >
                  Chat Sekarang
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Telepon</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="outline"
                  onClick={() => window.open('tel:+6289663596711')}
                >
                  +6289663596711
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-teal-600" />
                </div>
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="outline"
                  onClick={() => window.open('mailto:support@sipalingkost.com')}
                >
                  Kirim Email
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}