import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, Search, HelpCircle, Info, Menu, User } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/search", label: "Cari Kos", icon: Search },
    { href: "/bantuan", label: "Bantuan", icon: HelpCircle },
    { href: "/tentang", label: "Tentang", icon: Info },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <div className="text-2xl font-bold text-primary">
              <Home className="inline w-6 h-6 mr-2" />
              KosKu
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
            <Button variant="ghost" className="text-gray-700 hover:text-primary text-sm font-medium hidden md:block">
              Masuk
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Daftar
            </Button>
            
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
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start" size="lg">
                      <User className="w-5 h-5 mr-3" />
                      Masuk
                    </Button>
                    <Button className="w-full justify-start bg-primary hover:bg-primary/90" size="lg">
                      <User className="w-5 h-5 mr-3" />
                      Daftar
                    </Button>
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
