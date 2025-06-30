import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, EyeOff, Home, Mail, Lock, User, Phone, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWhatsAppVerification, setShowWhatsAppVerification] = useState(false);
  const [whatsAppData, setWhatsAppData] = useState({
    phone: "",
    verificationCode: "",
  });
  const { toast } = useToast();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "pencari" as "pencari" | "pemilik",
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login gagal");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login Berhasil!",
        description: `Selamat datang kembali, ${data.user.name}`,
      });
      localStorage.setItem("user", JSON.stringify(data.user));
      setLocation(data.user.role === "pemilik" ? "/dashboard" : "/");
    },
    onError: (error: Error) => {
      toast({
        title: "Login Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: typeof registerData) => {
      const { confirmPassword, ...dataToSend } = userData;
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registrasi gagal");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registrasi Berhasil!",
        description: `Akun ${data.user.name} telah dibuat. Silakan login.`,
      });
      // Reset form and switch to login tab
      setRegisterData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "pencari",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registrasi Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Error",
        description: "Password dan konfirmasi password tidak sama",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate(registerData);
  };

  const handleWhatsAppVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!whatsAppData.verificationCode) {
      // Send verification code
      if (whatsAppData.phone) {
        toast({
          title: "Kode Verifikasi Dikirim",
          description: `Kode verifikasi telah dikirim ke WhatsApp ${whatsAppData.phone}`,
        });
      }
      return;
    }

    if (whatsAppData.verificationCode.length === 6) {
      // Verify code and login
      const mockUser = {
        id: 999,
        name: "WhatsApp User",
        email: `${whatsAppData.phone}@whatsapp.user`,
        role: "pencari"
      };
      
      localStorage.setItem("user", JSON.stringify(mockUser));
      
      toast({
        title: "Login Berhasil!",
        description: "Anda berhasil masuk dengan WhatsApp",
      });
      
      setShowWhatsAppVerification(false);
      setWhatsAppData({ phone: "", verificationCode: "" });
      setLocation("/");
    } else {
      toast({
        title: "Kode Tidak Valid",
        description: "Masukkan kode verifikasi 6 digit yang benar",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-green-500 to-emerald-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Home className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">SI PALING KOST</h1>
          <p className="text-white/80">Masuk atau daftar untuk melanjutkan</p>
        </div>

        {/* Auth Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-gray-900">Selamat Datang</CardTitle>
            <CardDescription>
              Kelola pencarian kos Anda dengan mudah
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Masuk</TabsTrigger>
                <TabsTrigger value="register">Daftar</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="nama@email.com"
                        className="pl-10"
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password"
                        className="pl-10 pr-10"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Ingat saya
                    </label>
                    <button type="button" className="text-primary hover:underline">
                      Lupa password?
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Memproses..." : "Masuk"}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nama Lengkap</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Nama lengkap Anda"
                        className="pl-10"
                        value={registerData.name}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="nama@email.com"
                        className="pl-10"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-phone">Nomor Telepon</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="+62 812 3456 7890"
                        className="pl-10"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Buat password"
                        className="pl-10 pr-10"
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-role">Daftar Sebagai</Label>
                    <Select
                      value={registerData.role}
                      onValueChange={(value: "pencari" | "pemilik") => 
                        setRegisterData(prev => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih peran Anda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pencari">Pencari Kos</SelectItem>
                        <SelectItem value="pemilik">Pemilik Kos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Konfirmasi Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="register-confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Ulangi password"
                        className="pl-10"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <label className="flex items-start">
                      <input type="checkbox" className="mr-2 mt-1" required />
                      <span>
                        Saya setuju dengan{" "}
                        <button type="button" className="text-primary hover:underline">
                          Syarat & Ketentuan
                        </button>{" "}
                        dan{" "}
                        <button type="button" className="text-primary hover:underline">
                          Kebijakan Privasi
                        </button>
                      </span>
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Memproses..." : "Daftar"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* WhatsApp Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Atau masuk dengan</span>
                </div>
              </div>

              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowWhatsAppVerification(true)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="text-white hover:text-white/80 hover:bg-white/10"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>

      {/* WhatsApp Verification Modal */}
      <Dialog open={showWhatsAppVerification} onOpenChange={setShowWhatsAppVerification}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Masuk dengan WhatsApp
            </DialogTitle>
            <DialogDescription>
              Masukkan nomor WhatsApp Anda untuk mendapatkan kode verifikasi
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleWhatsAppVerification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-phone">Nomor WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="whatsapp-phone"
                  type="tel"
                  placeholder="+62 812 3456 7890"
                  className="pl-10"
                  value={whatsAppData.phone}
                  onChange={(e) => setWhatsAppData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
            </div>

            {whatsAppData.phone && (
              <div className="space-y-2">
                <Label htmlFor="verification-code">Kode Verifikasi</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="Masukkan 6 digit kode"
                  maxLength={6}
                  value={whatsAppData.verificationCode}
                  onChange={(e) => setWhatsAppData(prev => ({ ...prev, verificationCode: e.target.value }))}
                />
                <p className="text-sm text-gray-500">
                  Kode verifikasi telah dikirim ke WhatsApp {whatsAppData.phone}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowWhatsAppVerification(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!whatsAppData.phone}
              >
                {whatsAppData.phone && !whatsAppData.verificationCode 
                  ? "Kirim Kode" 
                  : whatsAppData.verificationCode 
                  ? "Verifikasi" 
                  : "Lanjutkan"
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}