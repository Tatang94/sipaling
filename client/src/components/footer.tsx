import { Home, Facebook, Twitter, Instagram, MessageCircle, Phone } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  const quickLinks = [
    { href: "/", label: "Beranda" },
    { href: "/cari-lokasi", label: "Cari Kos" },
    { href: "/daftar-kos", label: "Daftarkan Kos" },
    { href: "/bantuan", label: "Bantuan" },
    { href: "/tentang", label: "Tentang Kami" },
  ];

  const supportLinks = [
    { href: "/dukungan", label: "Dukungan" },
    { href: "/faq", label: "FAQ" },
    { href: "/kontak", label: "Hubungi Kami" },
    { href: "/privasi", label: "Kebijakan Privasi" },
    { href: "/syarat", label: "Syarat & Ketentuan" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: MessageCircle, href: "#", label: "WhatsApp" },
  ];

  return (
    <footer className="bg-gray-900 text-white py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center mb-6">
              <div className="text-2xl font-bold text-primary">
                <Home className="inline w-6 h-6 mr-2" />
                KosKu
              </div>
            </Link>
            <p className="text-gray-300 mb-6 max-w-md">
              Platform terpercaya untuk mencari dan menyewakan kos-kosan di seluruh Indonesia. 
              Menghubungkan pencari kos dengan pemilik properti dengan mudah dan aman.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Tautan Cepat</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Dukungan</h3>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="flex items-center text-gray-300">
                <Phone className="w-4 h-4 mr-2" />
                <a href="tel:+6289663596711" className="hover:text-white transition-colors">
                  +6289663596711
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 KosKu. Semua hak dilindungi undang-undang.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
