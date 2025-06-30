import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useFaceApi, type FaceDescriptor } from "@/hooks/use-face-api";

interface CircularFaceCameraProps {
  onCapture: (faceData: FaceDescriptor) => void;
  onError: (error: string) => void;
  mode: 'register' | 'login';
  isProcessing?: boolean;
  className?: string;
}

export function CircularFaceCamera({ 
  onCapture, 
  onError, 
  mode, 
  isProcessing = false,
  className = ""
}: CircularFaceCameraProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureStep, setCaptureStep] = useState<'ready' | 'detecting' | 'success' | 'failed'>('ready');
  const [faceDetected, setFaceDetected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { isLoaded, error: faceApiError, detectFace } = useFaceApi();

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
        setCaptureStep('ready');
        
        // Start face detection loop
        startFaceDetection();
      }
    } catch (error) {
      onError("Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.");
    }
  }, [onError]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setIsCapturing(false);
    setFaceDetected(false);
    setCaptureStep('ready');
  }, []);

  const startFaceDetection = useCallback(() => {
    if (!isLoaded || !videoRef.current) return;

    detectionIntervalRef.current = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const face = await detectFace(videoRef.current);
        setFaceDetected(!!face);
      }
    }, 500); // Check every 500ms
  }, [isLoaded, detectFace]);

  const captureAndProcess = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isLoaded) return;

    setCaptureStep('detecting');

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    try {
      const faceData = await detectFace(video);
      
      if (faceData && faceData.confidence > 0.5) {
        setCaptureStep('success');
        stopCamera();
        onCapture(faceData);
      } else {
        setCaptureStep('failed');
        onError("Wajah tidak terdeteksi dengan jelas. Silakan posisikan wajah di tengah kamera.");
        setTimeout(() => setCaptureStep('ready'), 2000);
      }
    } catch (error) {
      setCaptureStep('failed');
      onError("Gagal memproses wajah. Silakan coba lagi.");
      setTimeout(() => setCaptureStep('ready'), 2000);
    }
  }, [isLoaded, detectFace, onCapture, onError, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    if (faceApiError) {
      onError(faceApiError);
    }
  }, [faceApiError, onError]);

  const getCameraStatus = () => {
    if (!isLoaded) return { text: "Memuat model AI...", color: "text-gray-500" };
    if (captureStep === 'detecting') return { text: "Memproses wajah...", color: "text-blue-600" };
    if (captureStep === 'success') return { text: "Wajah berhasil dideteksi!", color: "text-green-600" };
    if (captureStep === 'failed') return { text: "Deteksi gagal, coba lagi", color: "text-red-600" };
    if (isCapturing && !faceDetected) return { text: "Posisikan wajah di tengah", color: "text-yellow-600" };
    if (isCapturing && faceDetected) return { text: "Wajah terdeteksi - siap foto", color: "text-green-600" };
    return { text: "Tekan tombol untuk mulai", color: "text-gray-600" };
  };

  const status = getCameraStatus();

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Circular Camera View */}
      <div className="relative">
        <div className="w-64 h-64 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-300 shadow-lg">
          {isCapturing ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
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

        {/* Face Detection Overlay */}
        {isCapturing && (
          <div className="absolute inset-0 w-64 h-64 rounded-full border-4 pointer-events-none"
               style={{
                 borderColor: faceDetected ? '#10b981' : '#ef4444',
                 borderStyle: 'dashed',
                 animation: faceDetected ? 'none' : 'pulse 2s infinite'
               }}>
            {captureStep === 'detecting' && (
              <div className="absolute inset-0 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            )}
            {captureStep === 'success' && (
              <div className="absolute inset-0 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            )}
            {captureStep === 'failed' && (
              <div className="absolute inset-0 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
            )}
          </div>
        )}

        {/* Loading Overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 w-64 h-64 rounded-full bg-gray-900/50 flex items-center justify-center">
            <div className="text-center text-white">
              <Loader2 className="mx-auto h-8 w-8 animate-spin mb-2" />
              <p className="text-sm">Memuat AI...</p>
            </div>
          </div>
        )}
      </div>

      {/* Status Text */}
      <p className={`text-sm font-medium ${status.color}`}>
        {status.text}
      </p>

      {/* Control Buttons */}
      <div className="flex gap-3">
        {!isCapturing && (
          <Button 
            onClick={startCamera} 
            disabled={!isLoaded || isProcessing}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            {mode === 'register' ? 'Mulai Registrasi' : 'Mulai Login'}
          </Button>
        )}
        
        {isCapturing && captureStep === 'ready' && (
          <>
            <Button 
              onClick={captureAndProcess} 
              disabled={!faceDetected || captureStep !== 'ready'}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
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
      </div>

      {/* Hidden Canvas for Processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}