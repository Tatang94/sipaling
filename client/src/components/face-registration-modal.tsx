import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FaceRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFaceRegistered: (faceData: string) => void;
  userName: string;
}

export function FaceRegistrationModal({ 
  isOpen, 
  onClose, 
  onFaceRegistered,
  userName 
}: FaceRegistrationModalProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const REQUIRED_PHOTOS = 3; // Ambil 3 foto untuk akurasi yang lebih baik

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
        const newImages = [...capturedImages, imageData];
        setCapturedImages(newImages);
        
        if (newImages.length < REQUIRED_PHOTOS) {
          setCurrentStep(newImages.length + 1);
          toast({
            title: `Foto ${newImages.length} Berhasil`,
            description: `Silakan ambil foto ke-${newImages.length + 1} dengan pose berbeda.`,
          });
        } else {
          stopCamera();
          toast({
            title: "Semua Foto Berhasil",
            description: "Memproses data wajah Anda...",
          });
          processFaceData(newImages);
        }
      }
    }
  }, [capturedImages, stopCamera, toast]);

  const processFaceData = async (images: string[]) => {
    setIsProcessing(true);
    
    try {
      // Simulasi processing face data
      // Dalam implementasi nyata, ini akan menggabungkan multiple images untuk akurasi lebih baik
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Gabungkan multiple face data menjadi satu template
      const faceTemplate = await createFaceTemplate(images);
      
      onFaceRegistered(faceTemplate);
      
      toast({
        title: "Registrasi Wajah Berhasil",
        description: "Data wajah Anda telah tersimpan dengan aman.",
      });
      
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      toast({
        title: "Error Processing",
        description: "Gagal memproses data wajah. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulasi pembuatan face template dari multiple images
  const createFaceTemplate = async (images: string[]): Promise<string> => {
    // Dalam implementasi nyata, ini akan menggunakan algoritma face recognition
    // untuk membuat template yang unik dari multiple angles
    return btoa(JSON.stringify({
      userId: Date.now(),
      images: images,
      timestamp: new Date().toISOString(),
      version: "1.0"
    }));
  };

  const resetRegistration = () => {
    setCapturedImages([]);
    setCurrentStep(1);
    setIsProcessing(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetRegistration();
    } else {
      stopCamera();
    }
  }, [isOpen, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const getInstructions = () => {
    switch (currentStep) {
      case 1:
        return "Posisikan wajah Anda di tengah kamera dan lihat langsung ke depan";
      case 2:
        return "Miringkan kepala sedikit ke kiri dan tersenyum";
      case 3:
        return "Miringkan kepala sedikit ke kanan dan tetap lihat ke kamera";
      default:
        return "Memproses data wajah Anda...";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Registrasi Wajah</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            Hai {userName}! Daftarkan wajah Anda untuk keamanan tambahan
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-teal-600">
              Foto {Math.min(currentStep, REQUIRED_PHOTOS)} dari {REQUIRED_PHOTOS}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {getInstructions()}
            </div>
          </div>
          
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-[4/3]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ display: isCapturing ? 'block' : 'none' }}
            />
            {!isCapturing && !isProcessing && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <CameraOff className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Kamera tidak aktif</p>
                </div>
              </div>
            )}
            {isProcessing && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 animate-pulse" />
                  <p className="mt-2 text-sm text-gray-500">Memproses data wajah...</p>
                </div>
              </div>
            )}
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Progress indicator */}
          <div className="flex gap-1 justify-center">
            {Array.from({ length: REQUIRED_PHOTOS }, (_, i) => (
              <div
                key={i}
                className={`h-2 w-8 rounded-full ${
                  i < capturedImages.length
                    ? 'bg-green-500'
                    : i === currentStep - 1
                    ? 'bg-teal-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            {!isProcessing ? (
              <>
                {!isCapturing ? (
                  <Button 
                    onClick={startCamera} 
                    className="flex-1"
                    variant="outline"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Mulai Registrasi
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={capturePhoto} 
                      className="flex-1"
                      disabled={capturedImages.length >= REQUIRED_PHOTOS}
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
              <Button disabled className="flex-1">
                Memproses...
              </Button>
            )}
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Data wajah Anda akan dienkripsi dan disimpan dengan aman untuk verifikasi login
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}