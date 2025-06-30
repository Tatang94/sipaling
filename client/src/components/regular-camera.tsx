import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface SimpleFaceData {
  imageData: string;
  timestamp: string;
}

interface RegularCameraProps {
  onCapture: (faceData: SimpleFaceData) => void;
  onError: (error: string) => void;
  mode: 'register' | 'login';
  isProcessing?: boolean;
  className?: string;
}

export function RegularCamera({ 
  onCapture, 
  onError, 
  mode, 
  isProcessing = false,
  className = ""
}: RegularCameraProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureStep, setCaptureStep] = useState<'ready' | 'capturing' | 'processing' | 'success' | 'failed'>('ready');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      console.log('Meminta akses kamera...');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser tidak mendukung akses kamera');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      console.log('Kamera berhasil diakses');
      
      const video = videoRef.current;
      if (!video) {
        throw new Error('Video element not found');
      }
      
      video.srcObject = stream;
      streamRef.current = stream;
      
      setIsCapturing(true);
      setCaptureStep('capturing');
      
      video.onloadedmetadata = () => {
        console.log('Video metadata loaded');
        video.play().catch(err => {
          console.error('Error playing video:', err);
          onError("Tidak dapat memulai video kamera.");
        });
      };
      
    } catch (error: any) {
      console.error('Error kamera:', error);
      let errorMessage = "Tidak dapat mengakses kamera. ";
      if (error && error.name === 'NotAllowedError') {
        errorMessage += "Izin kamera ditolak. Silakan beri izin kamera di browser Anda.";
      } else if (error && error.name === 'NotFoundError') {
        errorMessage += "Kamera tidak ditemukan. Pastikan perangkat memiliki kamera.";
      } else {
        errorMessage += "Pastikan izin kamera sudah diberikan dan browser mendukung kamera.";
      }
      onError(errorMessage);
    }
  }, [onError]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
    setCaptureStep('ready');
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    setCaptureStep('processing');

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) {
      onError("Tidak dapat memproses gambar");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    setCaptureStep('success');
    stopCamera();
    
    const faceData: SimpleFaceData = {
      imageData,
      timestamp: new Date().toISOString()
    };
    
    console.log('Foto berhasil diambil');
    onCapture(faceData);
  }, [onCapture, onError, stopCamera]);

  const resetCapture = () => {
    setCaptureStep('ready');
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const getStatusText = () => {
    switch (captureStep) {
      case 'ready':
        return "Tekan tombol untuk mulai menggunakan kamera";
      case 'capturing':
        return "Posisikan wajah di depan kamera dan tekan tombol foto";
      case 'processing':
        return "Memproses foto...";
      case 'success':
        return mode === 'register' ? "Foto berhasil diambil untuk registrasi!" : "Foto berhasil diambil untuk login!";
      case 'failed':
        return "Gagal mengambil foto. Silakan coba lagi.";
      default:
        return "";
    }
  };

  const status = getStatusText();
  const statusColor = captureStep === 'success' ? 'text-green-600' : 
                     captureStep === 'failed' ? 'text-red-600' : 
                     captureStep === 'processing' ? 'text-blue-600' : 'text-gray-600';

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Debug info */}
      <div className="text-xs text-gray-500">
        Debug: isCapturing={isCapturing.toString()}, step={captureStep}
      </div>
      
      {/* Regular Camera View */}
      <div className="relative">
        <div className="w-80 h-60 bg-gray-100 border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden">
          {isCapturing ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              onLoadedMetadata={() => console.log('Video loaded and ready')}
              onError={(e) => console.error('Video error:', e)}
              onCanPlay={() => console.log('Video can play')}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Camera className="mx-auto h-16 w-16 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Kamera Wajah</p>
              </div>
            </div>
          )}
        </div>

        {/* Status Overlay */}
        {captureStep === 'processing' && (
          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center rounded-lg">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        )}
        
        {captureStep === 'success' && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded-lg">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        )}
        
        {captureStep === 'failed' && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center rounded-lg">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        )}

        {/* Camera Frame Indicator */}
        {isCapturing && (
          <div className="absolute inset-0 border-4 border-dashed border-teal-500 animate-pulse pointer-events-none rounded-lg"></div>
        )}
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Status Text */}
      <p className={`text-sm font-medium text-center max-w-xs ${statusColor}`}>
        {status}
      </p>

      {/* Control Buttons */}
      <div className="flex gap-3">
        {captureStep === 'ready' && (
          <Button 
            onClick={async () => {
              console.log('Button clicked, calling startCamera');
              try {
                await startCamera();
              } catch (error) {
                console.error('Error in button click handler:', error);
                onError('Gagal memulai kamera: ' + String(error));
              }
            }} 
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            {mode === 'register' ? 'Mulai Registrasi' : 'Mulai Login'}
          </Button>
        )}

        {captureStep === 'capturing' && (
          <>
            <Button 
              onClick={capturePhoto}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Ambil Foto
            </Button>
            <Button 
              onClick={stopCamera}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CameraOff className="h-4 w-4" />
              Batal
            </Button>
          </>
        )}

        {(captureStep === 'success' || captureStep === 'failed') && (
          <Button 
            onClick={resetCapture}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Coba Lagi
          </Button>
        )}
      </div>
    </div>
  );
}