import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RegularCamera } from "./regular-camera";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface FaceRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFaceRegistered: (faceData: string) => void;
  userName: string;
}

interface SimpleFaceData {
  imageData: string;
  timestamp: string;
}

export function FaceRegistrationModal({ 
  isOpen, 
  onClose, 
  onFaceRegistered,
  userName 
}: FaceRegistrationModalProps) {
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const REQUIRED_PHOTOS = 3; // Ambil 3 foto untuk akurasi yang lebih baik

  const handleCameraCapture = async (faceData: SimpleFaceData) => {
    const newImages = [...capturedImages, faceData.imageData];
    setCapturedImages(newImages);
    
    if (newImages.length < REQUIRED_PHOTOS) {
      setCurrentStep(newImages.length + 1);
      toast({
        title: `Foto ${newImages.length} Berhasil`,
        description: `Ambil ${REQUIRED_PHOTOS - newImages.length} foto lagi untuk melengkapi registrasi`,
        variant: "default",
      });
    } else {
      // All photos captured, process registration
      setIsProcessing(true);
      
      try {
        // Simulate face processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demo purposes, we'll use the first image as the face data
        const faceData = newImages[0];
        
        toast({
          title: "Registrasi Berhasil",
          description: "Wajah Anda telah terdaftar. Sekarang Anda dapat login menggunakan wajah.",
          variant: "default",
        });
        
        onFaceRegistered(faceData);
        onClose();
        
        // Reset state
        setCapturedImages([]);
        setCurrentStep(1);
        
      } catch (error) {
        console.error('Face registration error:', error);
        toast({
          title: "Registrasi Gagal",
          description: "Terjadi kesalahan saat mendaftarkan wajah. Silakan coba lagi.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleCameraError = (error: string) => {
    console.error('Camera error:', error);
    toast({
      title: "Error Kamera",
      description: error,
      variant: "destructive",
    });
  };

  const resetRegistration = () => {
    setCapturedImages([]);
    setCurrentStep(1);
    setIsProcessing(false);
  };

  const getStepInstructions = () => {
    switch (currentStep) {
      case 1:
        return "Foto 1: Hadap lurus ke kamera dengan ekspresi normal";
      case 2:
        return "Foto 2: Sedikit miringkan kepala ke kiri";
      case 3:
        return "Foto 3: Sedikit miringkan kepala ke kanan";
      default:
        return "Memproses data wajah...";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            Registrasi Wajah
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Hai <span className="font-semibold">{userName}</span>!
            </p>
            <p className="text-sm text-gray-600">
              Ambil {REQUIRED_PHOTOS} foto wajah untuk registrasi
            </p>
          </div>
          
          {!isProcessing ? (
            <>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800 text-center">
                  <span className="font-semibold">Langkah {currentStep} dari {REQUIRED_PHOTOS}</span>
                </p>
                <p className="text-xs text-blue-600 text-center mt-1">
                  {getStepInstructions()}
                </p>
              </div>
              
              <RegularCamera
                mode="register"
                onCapture={handleCameraCapture}
                onError={handleCameraError}
                isProcessing={false}
                className="w-full"
              />
              
              {/* Progress indicator */}
              <div className="flex justify-center space-x-2">
                {Array.from({ length: REQUIRED_PHOTOS }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index < capturedImages.length
                        ? 'bg-green-500'
                        : index === capturedImages.length
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              {capturedImages.length > 0 && (
                <div className="text-center">
                  <Button
                    onClick={resetRegistration}
                    variant="outline"
                    size="sm"
                  >
                    Mulai Ulang
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Memproses data wajah...
                </p>
                <p className="text-xs text-gray-600">
                  Tunggu sebentar, kami sedang menyimpan data wajah Anda
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}