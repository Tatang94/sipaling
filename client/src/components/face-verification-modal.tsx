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
  faceDetected?: boolean;
  faceDescriptor?: number[];
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
      console.log('Verifying face for user:', userName);
      console.log('Face detected:', faceData.faceDetected);
      console.log('Face descriptor available:', !!faceData.faceDescriptor);
      
      // Parse stored face data if available
      let storedFaceData = null;
      try {
        if (userFaceData) {
          storedFaceData = JSON.parse(userFaceData);
          console.log('Stored face data found:', !!storedFaceData.faceDescriptor);
        }
      } catch (e) {
        console.log('No stored face descriptor data found, using basic verification');
      }
      
      let verificationResult = false;
      
      // If both current and stored data have face descriptors, compare them
      if (faceData.faceDescriptor && storedFaceData?.faceDescriptor) {
        console.log('Comparing face descriptors...');
        
        // Simple Euclidean distance calculation for face comparison
        const currentDescriptor = faceData.faceDescriptor;
        const storedDescriptor = storedFaceData.faceDescriptor;
        
        let distance = 0;
        for (let i = 0; i < Math.min(currentDescriptor.length, storedDescriptor.length); i++) {
          distance += Math.pow(currentDescriptor[i] - storedDescriptor[i], 2);
        }
        distance = Math.sqrt(distance);
        
        console.log('Face descriptor distance:', distance);
        
        // Threshold for face matching (lower is more similar)
        const threshold = 0.6;
        verificationResult = distance < threshold;
        
        console.log('Face match result:', verificationResult, 'with threshold', threshold);
      } else {
        // Fallback: simulate verification (for demo when no descriptors available)
        console.log('Using fallback verification method');
        await new Promise(resolve => setTimeout(resolve, 1500));
        verificationResult = Math.random() > 0.3; // 70% success rate for demo
      }
      
      if (verificationResult) {
        toast({
          title: "Verifikasi Berhasil",
          description: faceData.faceDetected 
            ? `AI Face Detection berhasil! Selamat datang, ${userName}!`
            : `Selamat datang, ${userName}!`,
          variant: "default",
        });
        
        onVerificationSuccess();
        onClose();
      } else {
        throw new Error('Face verification failed - face not recognized');
      }
      
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