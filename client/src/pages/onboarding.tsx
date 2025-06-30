import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    
    // Save user role preference
    localStorage.setItem("userRole", role);
    localStorage.setItem("hasSeenOnboarding", "true");
    
    toast({
      title: "Peran Dipilih!",
      description: `Silakan login dengan verifikasi wajah sebagai ${role === "seeker" ? "Pencari Kos" : "Pemilik Kos"}`,
    });

    // Navigate to face authentication after selection
    setTimeout(() => {
      setLocation("/face-login");
    }, 2000);
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Masuk ke SI PALING KOST</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Subtitle */}
        <p className="text-gray-600 mb-8 text-center">
          Saya ingin masuk sebagai
        </p>

        {/* Role Selection Cards */}
        <div className="space-y-4">
          {/* Pencari Kos */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary"
            onClick={() => handleRoleSelect("seeker")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  {/* Seeker Icon */}
                  <svg 
                    width="32" 
                    height="32" 
                    viewBox="0 0 64 64" 
                    className="text-blue-600"
                  >
                    <rect x="12" y="32" width="40" height="24" rx="4" fill="currentColor" opacity="0.3"/>
                    <circle cx="32" cy="20" r="8" fill="currentColor"/>
                    <rect x="28" y="28" width="8" height="4" fill="currentColor"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Pencari Kos</h3>
                  <p className="text-gray-600 text-sm">Mencari tempat tinggal yang nyaman</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pemilik Kos */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary"
            onClick={() => handleRoleSelect("owner")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                  {/* Owner Icon */}
                  <svg 
                    width="32" 
                    height="32" 
                    viewBox="0 0 64 64" 
                    className="text-green-600"
                  >
                    <rect x="16" y="24" width="32" height="32" rx="4" fill="currentColor" opacity="0.3"/>
                    <polygon points="32,8 48,24 16,24" fill="currentColor"/>
                    <rect x="28" y="40" width="8" height="12" fill="currentColor"/>
                    <circle cx="24" cy="36" r="2" fill="currentColor"/>
                    <circle cx="40" cy="36" r="2" fill="currentColor"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Pemilik Kos</h3>
                  <p className="text-gray-600 text-sm">Menyewakan properti kos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Link */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Butuh bantuan?{" "}
            <Button
              variant="link"
              className="text-primary hover:underline p-0 h-auto font-normal text-sm"
              onClick={() => setLocation("/bantuan")}
            >
              Klik di Sini
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}