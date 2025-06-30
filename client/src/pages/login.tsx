import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FaceVerificationModal } from "@/components/face-verification-modal";
import { FaceRegistrationModal } from "@/components/face-registration-modal";
import { Shield, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loginStep, setLoginStep] = useState<'credentials' | 'face-verification'>('credentials');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showFaceVerification, setShowFaceVerification] = useState(false);
  const [showFaceRegistration, setShowFaceRegistration] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Check user's face registration status
  const { data: faceStatus } = useQuery({
    queryKey: ['/api/users', currentUser?.id, 'face-status'],
    enabled: !!currentUser?.id,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest('POST', '/api/auth/login', data);
      
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentUser(data.user);
      
      // Check if user has face verification enabled
      if (data.user.faceRegistered) {
        setLoginStep('face-verification');
        setShowFaceVerification(true);
      } else {
        // Ask if user wants to register face for additional security
        toast({
          title: "Login Berhasil",
          description: "Daftarkan wajah Anda untuk keamanan tambahan?",
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFaceRegistration(true)}
            >
              Daftar Wajah
            </Button>
          ),
        });
        
        // Complete login without face verification
        completeLogin(data);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerFaceMutation = useMutation({
    mutationFn: async (faceData: string) => {
      const response = await apiRequest('POST', `/api/users/${currentUser.id}/register-face`, { faceData });
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registrasi Wajah Berhasil",
        description: "Wajah Anda telah terdaftar untuk keamanan login.",
      });
      completeLogin({ user: currentUser, token: 'demo-token' });
    },
    onError: (error: Error) => {
      toast({
        title: "Registrasi Wajah Gagal",
        description: error.message,
        variant: "destructive",
      });
      // Complete login without face registration
      completeLogin({ user: currentUser, token: 'demo-token' });
    },
  });

  const completeLogin = (data: any) => {
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token || 'demo-token');
    
    toast({
      title: "Login Berhasil",
      description: `Selamat datang, ${data.user.name}!`,
    });

    // Redirect based on user role
    if (data.user.role === 'pemilik') {
      setLocation('/dashboard');
    } else {
      setLocation('/');
    }
  };

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const handleFaceVerificationSuccess = () => {
    completeLogin({ user: currentUser, token: 'demo-token' });
  };

  const handleFaceRegistration = (faceData: string) => {
    registerFaceMutation.mutate(faceData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-teal-600 p-3 rounded-full">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Masuk Akun</CardTitle>
          <CardDescription className="text-center">
            Masukkan email dan password Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contoh@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-700">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Keamanan Wajah</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Aplikasi dilengkapi verifikasi wajah untuk keamanan maksimal
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{" "}
              <Link href="/register" className="text-teal-600 hover:underline">
                Daftar di sini
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

      {/* Face Verification Modal */}
      <FaceVerificationModal
        isOpen={showFaceVerification}
        onClose={() => {
          setShowFaceVerification(false);
          // If user closes modal, complete login without face verification
          if (currentUser) {
            completeLogin({ user: currentUser, token: 'demo-token' });
          }
        }}
        onVerificationSuccess={handleFaceVerificationSuccess}
        userFaceData={currentUser?.faceData}
        userName={currentUser?.name || ''}
      />

      {/* Face Registration Modal */}
      <FaceRegistrationModal
        isOpen={showFaceRegistration}
        onClose={() => {
          setShowFaceRegistration(false);
          // Complete login without face registration
          if (currentUser) {
            completeLogin({ user: currentUser, token: 'demo-token' });
          }
        }}
        onFaceRegistered={handleFaceRegistration}
        userName={currentUser?.name || ''}
      />
    </div>
  );
}