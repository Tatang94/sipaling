import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, Search, HelpCircle, Info, Menu, User, MapPin, Scan, UserPlus } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/search", label: "Cari Kos", icon: Search },
    { href: "/cari-lokasi", label: "Lokasi GPS", icon: MapPin },
    { href: "/bantuan", label: "Bantuan", icon: HelpCircle },
    { href: "/tentang", label: "Tentang", icon: Info },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/splash" className="flex-shrink-0 flex items-center">
            <div className="text-2xl font-bold text-primary">
              <Home className="inline w-6 h-6 mr-2" />
              SI PALING KOST
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    location === item.href
                      ? "text-primary"
                      : "text-gray-700 hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Face Login/Register Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/face-login">
                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                  <Scan className="w-4 h-4 mr-2" />
                  Login Wajah
                </Button>
              </Link>
              <Link href="/face-register">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Daftar
                </Button>
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2 text-base font-medium rounded-lg transition-colors ${
                          location === item.href
                            ? "text-primary bg-primary/10"
                            : "text-gray-700 hover:text-primary hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                  
                  {/* Mobile Face Auth Buttons */}
                  <div className="border-t pt-4">
                    <Link
                      href="/face-login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2 text-base font-medium rounded-lg text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Scan className="w-5 h-5" />
                      <span>Login dengan Wajah</span>
                    </Link>
                    <Link
                      href="/face-register"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2 text-base font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors mt-2"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>Daftar Akun Baru</span>
                    </Link>
                  </div>

                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
