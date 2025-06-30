import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FaceRegistrationModal } from "@/components/face-registration-modal";
import { Camera, UserPlus, Shield } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  role: z.enum(["pencari", "pemilik"], {
    required_error: "Silakan pilih peran Anda",
  }),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function FaceRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showFaceRegistration, setShowFaceRegistration] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegisterForm | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const role = watch("role");

  const createAccountMutation = useMutation({
    mutationFn: async (data: { userData: RegisterForm; faceData: string }) => {
      const response = await apiRequest('/api/auth/register-face', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registrasi gagal');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token || 'demo-token');
      
      toast({
        title: "Registrasi Berhasil",
        description: "Akun Anda telah dibuat dengan verifikasi wajah!",
      });

      // Redirect based on role
      if (data.user.role === 'pemilik') {
        setLocation('/dashboard');
      } else {
        setLocation('/');
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registrasi Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterForm) => {
    setRegistrationData(data);
    setShowFaceRegistration(true);
  };

  const handleFaceRegistration = (faceData: string) => {
    if (registrationData) {
      createAccountMutation.mutate({
        userData: registrationData,
        faceData: faceData
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-teal-600 p-3 rounded-full">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Daftar dengan Wajah</CardTitle>
          <CardDescription className="text-center">
            Registrasi menggunakan verifikasi wajah untuk keamanan maksimal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                placeholder="Masukkan nama lengkap"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor WhatsApp</Label>
              <Input
                id="phone"
                placeholder="08xxxxxxxxxx"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Saya adalah:</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => setValue("role", value as "pencari" | "pemilik")}
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="pencari" id="pencari" />
                  <Label htmlFor="pencari" className="flex-1 cursor-pointer">
                    <div className="font-medium">Pencari Kos</div>
                    <div className="text-sm text-gray-500">Saya ingin mencari tempat kos</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="pemilik" id="pemilik" />
                  <Label htmlFor="pemilik" className="flex-1 cursor-pointer">
                    <div className="font-medium">Pemilik Kos</div>
                    <div className="text-sm text-gray-500">Saya ingin menyewakan kos</div>
                  </Label>
                </div>
              </RadioGroup>
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-700">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Keamanan Biometrik</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Tanpa password! Login hanya dengan wajah Anda yang telah terdaftar
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createAccountMutation.isPending}
            >
              <Camera className="mr-2 h-4 w-4" />
              Lanjut ke Registrasi Wajah
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{" "}
              <Link href="/face-login" className="text-teal-600 hover:underline">
                Login dengan Wajah
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:underline">
              ← Kembali ke Beranda
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Face Registration Modal */}
      <FaceRegistrationModal
        isOpen={showFaceRegistration}
        onClose={() => {
          setShowFaceRegistration(false);
          setRegistrationData(null);
        }}
        onFaceRegistered={handleFaceRegistration}
        userName={registrationData?.name || ''}
      />
    </div>
  );
}