import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FaceVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: () => void;
  userFaceData?: string; // Base64 encoded face data from registration
  userName: string;
}

export function FaceVerificationModal({ 
  isOpen, 
  onClose, 
  onVerificationSuccess, 
  userFaceData,
  userName 
}: FaceVerificationModalProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'pending' | 'success' | 'failed'>('pending');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

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
  }, []);

  const capturePhoto = useCallback(() => {
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
      }
    }
  }, [stopCamera]);

  const verifyFace = useCallback(async () => {
    if (!capturedImage || !userFaceData) {
      toast({
        title: "Error Verifikasi",
        description: "Data wajah tidak tersedia untuk verifikasi.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      // Simulasi face matching algorithm
      // Dalam implementasi nyata, ini akan menggunakan API face recognition
      const similarity = await simulateFaceMatching(capturedImage, userFaceData);
      
      if (similarity > 0.8) { // 80% similarity threshold
        setVerificationResult('success');
        toast({
          title: "Verifikasi Berhasil",
          description: `Selamat datang, ${userName}!`,
        });
        
        setTimeout(() => {
          onVerificationSuccess();
          onClose();
        }, 2000);
      } else {
        setVerificationResult('failed');
        toast({
          title: "Verifikasi Gagal",
          description: "Wajah tidak cocok dengan data yang terdaftar. Silakan coba lagi.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setVerificationResult('failed');
      toast({
        title: "Error Verifikasi",
        description: "Terjadi kesalahan saat verifikasi wajah.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  }, [capturedImage, userFaceData, userName, toast, onVerificationSuccess, onClose]);

  // Simulasi algoritma face matching
  const simulateFaceMatching = async (image1: string, image2: string): Promise<number> => {
    // Delay untuk simulasi processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulasi dengan random similarity score yang cenderung tinggi untuk demo
    // Dalam implementasi nyata, gunakan library seperti face-api.js atau API cloud
    return Math.random() * 0.4 + 0.6; // 60-100% similarity
  };

  const resetVerification = () => {
    setCapturedImage(null);
    setVerificationResult('pending');
    setIsVerifying(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetVerification();
    } else {
      stopCamera();
    }
  }, [isOpen, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Verifikasi Wajah</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            Silakan ambil foto wajah Anda untuk verifikasi identitas
          </div>
          
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
                {!isCapturing && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <CameraOff className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Kamera tidak aktif</p>
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
                {verificationResult === 'success' && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                )}
                {verificationResult === 'failed' && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="h-16 w-16 text-red-500" />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="flex gap-2">
            {!capturedImage ? (
              <>
                {!isCapturing ? (
                  <Button 
                    onClick={startCamera} 
                    className="flex-1"
                    variant="outline"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Mulai Kamera
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={capturePhoto} 
                      className="flex-1"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Ambil Foto
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
              </>
            ) : (
              <>
                <Button 
                  onClick={verifyFace} 
                  disabled={isVerifying || verificationResult === 'success'}
                  className="flex-1"
                >
                  {isVerifying ? "Memverifikasi..." : "Verifikasi Wajah"}
                </Button>
                <Button 
                  onClick={resetVerification} 
                  variant="outline"
                  disabled={isVerifying}
                >
                  Ulang
                </Button>
              </>
            )}
          </div>
          
          {verificationResult === 'failed' && (
            <div className="text-center text-sm text-red-600">
              Verifikasi gagal. Pastikan wajah Anda terlihat jelas dan sesuai dengan foto saat registrasi.
            </div>
          )}
          
          {verificationResult === 'success' && (
            <div className="text-center text-sm text-green-600">
              Verifikasi berhasil! Anda akan diarahkan ke dashboard.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}