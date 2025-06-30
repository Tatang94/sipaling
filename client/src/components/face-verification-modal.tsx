import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RegularCamera } from "./regular-camera";
import { useToast } from "@/hooks/use-toast";

interface FaceVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: () => void;
  userFaceData?: string; // Base64 encoded face data from registration
  userName: string;
}

interface SimpleFaceData {
  imageData: string;
  timestamp: string;
}

export function FaceVerificationModal({ 
  isOpen, 
  onClose, 
  onVerificationSuccess, 
  userFaceData,
  userName 
}: FaceVerificationModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleCameraCapture = async (faceData: SimpleFaceData) => {
    setIsVerifying(true);
    
    try {
      // Simulate face verification process
      // In a real app, this would call an API to verify the face
      console.log('Verifying face for user:', userName);
      console.log('Captured face data:', faceData.imageData.substring(0, 50) + '...');
      
      // For demo purposes, we'll just simulate a successful verification after 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Verifikasi Berhasil",
        description: `Selamat datang, ${userName}!`,
        variant: "default",
      });
      
      onVerificationSuccess();
      onClose();
      
    } catch (error) {
      console.error('Face verification error:', error);
      toast({
        title: "Verifikasi Gagal",
        description: "Wajah tidak dikenali. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            Verifikasi Wajah
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Hai <span className="font-semibold">{userName}</span>!
            </p>
            <p className="text-sm text-gray-600">
              Silakan verifikasi wajah Anda untuk masuk
            </p>
          </div>
          
          <RegularCamera
            mode="login"
            onCapture={handleCameraCapture}
            onError={handleCameraError}
            isProcessing={isVerifying}
            className="w-full"
          />
          
          {isVerifying && (
            <div className="text-center">
              <p className="text-sm text-blue-600">
                Memverifikasi wajah Anda...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}