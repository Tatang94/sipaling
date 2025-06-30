import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, AlertCircle, Scan } from "lucide-react";
import { RegularCamera } from "@/components/regular-camera";

interface SimpleFaceData {
  imageData: string;
  timestamp: string;
}

export default function FaceLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loginStep, setLoginStep] = useState<'ready' | 'verifying' | 'success' | 'failed'>('ready');

  const loginMutation = useMutation({
    mutationFn: async (faceData: SimpleFaceData) => {
      // Convert face data to base64 for API
      const faceDataString = btoa(JSON.stringify({
        imageData: faceData.imageData,
        timestamp: faceData.timestamp,
        type: 'login'
      }));
      
      const response = await apiRequest('POST', '/api/auth/face-login', { faceData: faceDataString });
      return response.json();
    },
    onSuccess: (data) => {
      setLoginStep('success');
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token || 'demo-token');
      
      toast({
        title: "Login Berhasil",
        description: `Selamat datang kembali, ${data.user.name}!`,
      });

      setTimeout(() => {
        if (data.user.role === 'pemilik') {
          setLocation('/dashboard');
        } else {
          setLocation('/');
        }
      }, 2000);
    },
    onError: (error: Error) => {
      setLoginStep('failed');
      toast({
        title: "Login Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFaceCapture = (faceData: SimpleFaceData) => {
    setLoginStep('verifying');
    loginMutation.mutate(faceData);
  };

  const handleError = (error: string) => {
    toast({
      title: "Error",
      description: error,
      variant: "destructive"
    });
  };

  const resetLogin = () => {
    setLoginStep('ready');
  };

  const getStepText = () => {
    switch (loginStep) {
      case 'ready':
        return "Gunakan kamera bulat untuk login dengan wajah Anda";
      case 'verifying':
        return "Memverifikasi wajah Anda dengan Face AI...";
      case 'success':
        return "Login berhasil! Mengarahkan ke dashboard...";
      case 'failed':
        return "Wajah tidak dikenali. Silakan coba lagi.";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-green-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className={`p-3 rounded-full ${
              loginStep === 'success' ? 'bg-green-600' : 
              loginStep === 'failed' ? 'bg-red-600' : 'bg-teal-600'
            }`}>
              {loginStep === 'success' ? (
                <CheckCircle className="h-6 w-6 text-white" />
              ) : loginStep === 'failed' ? (
                <AlertCircle className="h-6 w-6 text-white" />
              ) : (
                <Scan className="h-6 w-6 text-white" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Login dengan Wajah</CardTitle>
          <CardDescription className="text-center">
            {getStepText()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Circular Face Camera */}
            <RegularCamera
              mode="login"
              onCapture={handleFaceCapture}
              onError={handleError}
              isProcessing={loginStep === 'verifying'}
              className="flex justify-center"
            />
            
            {/* Verification Status */}
            {loginStep === 'verifying' && (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                <span className="text-sm text-gray-600">Memverifikasi dengan Face AI...</span>
              </div>
            )}

            {/* Reset Button for Failed Login */}
            {loginStep === 'failed' && (
              <div className="flex justify-center">
                <button 
                  onClick={resetLogin}
                  className="text-sm text-teal-600 hover:underline"
                >
                  Coba lagi dengan wajah berbeda
                </button>
              </div>
            )}
            
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <Scan className="h-4 w-4" />
                <span className="text-sm font-medium">Face AI Recognition</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Menggunakan teknologi Face-api.js untuk mengenali wajah Anda secara real-time
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{" "}
              <Link href="/face-register" className="text-teal-600 hover:underline">
                Daftar dengan Wajah
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
    </div>
  );
}