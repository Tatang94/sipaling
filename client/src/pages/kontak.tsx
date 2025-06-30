import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function KontakPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Chat langsung dengan tim support",
      contact: "+6289663596711",
      action: () => window.open('https://wa.me/6289663596711', '_blank'),
      color: "bg-green-100 text-green-600",
      available: "Online 24/7"
    },
    {
      icon: Phone,
      title: "Telepon",
      description: "Hubungi hotline customer service",
      contact: "+6289663596711",
      action: () => window.open('tel:+6289663596711'),
      color: "bg-blue-100 text-blue-600",
      available: "08:00 - 22:00 WIB"
    },
    {
      icon: Mail,
      title: "Email",
      description: "Kirim email untuk pertanyaan detail",
      contact: "support@sipalingkost.com",
      action: () => window.open('mailto:support@sipalingkost.com'),
      color: "bg-teal-100 text-teal-600",
      available: "Respon 1-24 jam"
    }
  ];

  const officeInfo = [
    {
      icon: MapPin,
      title: "Kantor Pusat",
      details: ["Jl. Sudirman No. 123", "Jakarta Pusat 10110", "Indonesia"]
    },
    {
      icon: Clock,
      title: "Jam Operasional",
      details: ["Senin - Jumat: 08:00 - 18:00 WIB", "Sabtu: 08:00 - 14:00 WIB", "Minggu: Libur"]
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulasi pengiriman form
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Pesan Terkirim!",
        description: "Tim kami akan menghubungi Anda dalam 1x24 jam.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        category: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Gagal Mengirim",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Hubungi Kami
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Tim customer service SI PALING KOST siap membantu Anda 24/7. 
            Jangan ragu untuk menghubungi kami dengan pertanyaan apapun.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cara Menghubungi Kami
            </h2>
            <p className="text-gray-600">
              Pilih metode yang paling nyaman untuk Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center">
                    <div className={`mx-auto w-12 h-12 ${method.color} rounded-lg flex items-center justify-center mb-4`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">{method.title}</CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div>
                      <p className="font-semibold text-gray-900">{method.contact}</p>
                      <p className="text-sm text-green-600">{method.available}</p>
                    </div>
                    <Button 
                      onClick={method.action}
                      className="w-full"
                      variant={index === 0 ? "default" : "outline"}
                    >
                      {method.title === "WhatsApp" ? "Chat Sekarang" : 
                       method.title === "Telepon" ? "Telepon Sekarang" : "Kirim Email"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Office Info */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Kirim Pesan
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nama Lengkap *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Nama Anda"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Nomor WhatsApp</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+62 812 3456 7890"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Kategori *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="umum">Pertanyaan Umum</SelectItem>
                        <SelectItem value="teknis">Masalah Teknis</SelectItem>
                        <SelectItem value="pembayaran">Pembayaran</SelectItem>
                        <SelectItem value="kemitraan">Kemitraan</SelectItem>
                        <SelectItem value="keluhan">Keluhan</SelectItem>
                        <SelectItem value="saran">Saran</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subjek *</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Subjek pesan Anda"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Pesan *</Label>
                  <Textarea
                    id="message"
                    placeholder="Jelaskan pertanyaan atau masalah Anda dengan detail..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Mengirim..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Kirim Pesan
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Office Info */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Informasi Kantor
              </h3>
              
              <div className="space-y-6">
                {officeInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <Card key={index} className="border-l-4 border-l-teal-600">
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">{info.title}</h4>
                            {info.details.map((detail, detailIndex) => (
                              <p key={detailIndex} className="text-gray-600">{detail}</p>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Quick Response Promise */}
                <Card className="bg-teal-50 border-teal-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h4 className="font-semibold text-teal-800 mb-2">
                        Jaminan Respon Cepat
                      </h4>
                      <p className="text-teal-700 text-sm">
                        ✓ WhatsApp: Respon dalam 5 menit<br />
                        ✓ Email: Respon maksimal 24 jam<br />
                        ✓ Telepon: Langsung terhubung
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-red-50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-red-800 mb-4">
            Kontak Darurat
          </h3>
          <p className="text-red-700 mb-6">
            Untuk masalah mendesak atau darurat, hubungi kami segera:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.open('https://wa.me/6289663596711', '_blank')}
              className="bg-red-600 hover:bg-red-700"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp Darurat
            </Button>
            <Button 
              onClick={() => window.open('tel:+6289663596711')}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            >
              <Phone className="w-4 h-4 mr-2" />
              Telepon Darurat
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}