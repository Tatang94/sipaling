import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Camera, CameraOff, CheckCircle, AlertCircle, Scan } from "lucide-react";

export default function FaceLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loginStep, setLoginStep] = useState<'ready' | 'capturing' | 'verifying' | 'success' | 'failed'>('ready');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const loginMutation = useMutation({
    mutationFn: async (faceData: string) => {
      const response = await apiRequest('/api/auth/face-login', {
        method: 'POST',
        body: JSON.stringify({ faceData }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login gagal');
      }
      
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

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
        setLoginStep('capturing');
      }
    } catch (error) {
      toast({
        title: "Error Kamera",
        description: "Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
    setLoginStep('ready');
  }, []);

  const captureAndLogin = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
        setLoginStep('verifying');
        
        // Create face data template for verification
        const faceData = btoa(JSON.stringify({
          image: imageData,
          timestamp: new Date().toISOString(),
          type: 'login'
        }));
        
        loginMutation.mutate(faceData);
      }
    }
  }, [stopCamera, loginMutation]);

  const resetLogin = () => {
    setCapturedImage(null);
    setLoginStep('ready');
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const getStepText = () => {
    switch (loginStep) {
      case 'ready':
        return "Tekan tombol untuk memulai login dengan wajah";
      case 'capturing':
        return "Posisikan wajah Anda di tengah kamera dan tekan tombol foto";
      case 'verifying':
        return "Memverifikasi wajah Anda...";
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
      <Card className="w-full max-w-md">
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
          <div className="space-y-4">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-[4/3]">
              {!capturedImage ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ display: isCapturing ? 'block' : 'none' }}
                  />
                  {!isCapturing && loginStep !== 'verifying' && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Camera className="mx-auto h-16 w-16 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Kamera siap digunakan</p>
                      </div>
                    </div>
                  )}
                  {loginStep === 'verifying' && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">Memverifikasi...</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="relative">
                  <img
                    src={capturedImage}
                    alt="Captured face"
                    className="w-full h-full object-cover"
                  />
                  {loginStep === 'success' && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                  )}
                  {loginStep === 'failed' && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                      <AlertCircle className="h-16 w-16 text-red-500" />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="flex gap-2">
              {loginStep === 'ready' && (
                <Button 
                  onClick={startCamera} 
                  className="flex-1"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Mulai Login
                </Button>
              )}
              
              {loginStep === 'capturing' && (
                <>
                  <Button 
                    onClick={captureAndLogin} 
                    className="flex-1"
                  >
                    <Scan className="mr-2 h-4 w-4" />
                    Ambil Foto & Login
                  </Button>
                  <Button 
                    onClick={stopCamera} 
                    variant="outline"
                  >
                    <CameraOff className="mr-2 h-4 w-4" />
                    Batal
                  </Button>
                </>
              )}
              
              {(loginStep === 'failed' || loginStep === 'success') && (
                <Button 
                  onClick={resetLogin} 
                  variant="outline"
                  className="flex-1"
                  disabled={loginStep === 'success'}
                >
                  Coba Lagi
                </Button>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-700">
                <Scan className="h-4 w-4" />
                <span className="text-sm font-medium">Login Biometrik</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Sistem akan mengenali wajah Anda yang telah terdaftar
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