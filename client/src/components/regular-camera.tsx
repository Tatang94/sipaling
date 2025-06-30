import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import * as faceapi from 'face-api.js';

interface SimpleFaceData {
  imageData: string;
  timestamp: string;
  faceDetected?: boolean;
  faceDescriptor?: number[];
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
  const [captureStep, setCaptureStep] = useState<'ready' | 'loading' | 'capturing' | 'processing' | 'success' | 'failed'>('ready');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load face-api.js models
  const loadModels = useCallback(async () => {
    try {
      setCaptureStep('loading');
      console.log('Loading face-api.js models...');
      
      const MODEL_URL = '/models'; // Models akan disimpan di public/models
      
      // Load models satu per satu untuk debugging
      console.log('Loading tiny face detector...');
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      console.log('Tiny face detector loaded');
      
      console.log('Loading face landmark 68...');
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      console.log('Face landmark 68 loaded');
      
      console.log('Loading face recognition net...');
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      console.log('Face recognition net loaded');
      
      console.log('All face-api.js models loaded successfully');
      setModelsLoaded(true);
      setCaptureStep('ready');
    } catch (error: any) {
      console.error('Error loading face-api.js models:', error);
      console.log('Specific error details:', {
        name: error?.name || 'Unknown',
        message: error?.message || String(error),
        stack: error?.stack || undefined
      });
      // Fallback to simple mode without face detection
      setModelsLoaded(false);
      setCaptureStep('ready');
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      console.log('Meminta akses kamera...');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser tidak mendukung akses kamera');
      }

      // Pastikan video element sudah ada sebelum meminta akses kamera
      const video = videoRef.current;
      if (!video) {
        throw new Error('Video element belum siap. Silakan coba lagi.');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      console.log('Kamera berhasil diakses');
      
      // Set stream ke video element
      video.srcObject = stream;
      streamRef.current = stream;
      
      // Tunggu video element siap, baru update state
      const waitForVideo = () => {
        return new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            video.play()
              .then(() => {
                console.log('Video playing successfully');
                // Set state hanya setelah video benar-benar siap
                setIsCapturing(true);
                setCaptureStep('capturing');
                resolve();
              })
              .catch(reject);
          };
          
          video.onerror = () => {
            reject(new Error('Video error'));
          };
          
          // Timeout jika video tidak load dalam 10 detik
          setTimeout(() => {
            reject(new Error('Video loading timeout'));
          }, 10000);
        });
      };
      
      await waitForVideo();
      
    } catch (error: any) {
      console.error('Error kamera:', error);
      let errorMessage = "Tidak dapat mengakses kamera. ";
      if (error && error.name === 'NotAllowedError') {
        errorMessage += "Izin kamera ditolak. Silakan beri izin kamera di browser Anda.";
      } else if (error && error.name === 'NotFoundError') {
        errorMessage += "Kamera tidak ditemukan. Pastikan perangkat memiliki kamera.";
      } else if (error && error.message.includes('Video element')) {
        errorMessage += "Komponen kamera belum siap. Silakan tunggu sebentar dan coba lagi.";
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

  const capturePhoto = useCallback(async () => {
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
    
    let faceDetected = false;
    let faceDescriptor = null;

    // Jika models sudah loaded, lakukan face detection
    if (modelsLoaded) {
      try {
        console.log('Detecting faces...');
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (detections.length > 0) {
          faceDetected = true;
          faceDescriptor = detections[0].descriptor;
          console.log(`Found ${detections.length} face(s)`);
        } else {
          console.log('No faces detected');
        }
      } catch (error) {
        console.error('Face detection error:', error);
        // Continue without face detection
      }
    }
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    setCaptureStep('success');
    stopCamera();
    
    const faceData: SimpleFaceData = {
      imageData,
      timestamp: new Date().toISOString(),
      // Add face detection results
      ...(faceDetected && { faceDetected: true }),
      ...(faceDescriptor && { faceDescriptor: Array.from(faceDescriptor) })
    };
    
    console.log('Foto berhasil diambil', faceDetected ? 'dengan deteksi wajah' : 'tanpa deteksi wajah');
    onCapture(faceData);
  }, [onCapture, onError, stopCamera, modelsLoaded]);

  const resetCapture = () => {
    setCaptureStep('ready');
  };

  // Load face-api.js models saat component mount
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Pastikan video element tersedia setelah component mount
  useEffect(() => {
    // Gunakan observer untuk memastikan video element benar-benar ada
    const checkVideoElement = () => {
      if (videoRef.current) {
        console.log('Video element tersedia:', videoRef.current);
        return true;
      }
      return false;
    };

    // Check immediately
    if (!checkVideoElement()) {
      // If not available, wait and check again
      const timer = setTimeout(() => {
        if (!checkVideoElement()) {
          console.warn('Video element belum tersedia setelah 500ms');
        }
      }, 500);
      
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    }

    return () => {
      stopCamera();
    };
  }, [stopCamera, loadModels]);

  const getStatusText = () => {
    switch (captureStep) {
      case 'loading':
        return "Memuat AI face detection models...";
      case 'ready':
        return modelsLoaded 
          ? "AI Face Detection siap! Tekan tombol untuk mulai" 
          : "Tekan tombol untuk mulai menggunakan kamera";
      case 'capturing':
        return "Posisikan wajah di depan kamera dan tekan tombol foto";
      case 'processing':
        return modelsLoaded 
          ? "Memproses foto dengan AI face detection..." 
          : "Memproses foto...";
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
      {/* Status AI Face Detection */}
      <div className="text-xs text-center">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
          modelsLoaded ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {modelsLoaded ? (
            <>
              <CheckCircle className="w-3 h-3" />
              <span>AI Face Detection Aktif</span>
            </>
          ) : (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Memuat AI Models...</span>
            </>
          )}
        </div>
      </div>
      
      {/* Regular Camera View */}
      <div className="relative">
        <div className="w-80 h-60 bg-gray-100 border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden">
          {/* Video element selalu ada, tapi disembunyikan jika tidak capturing */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isCapturing ? 'block' : 'hidden'}`}
            onLoadedMetadata={() => console.log('Video loaded and ready')}
            onError={(e) => console.error('Video error:', e)}
            onCanPlay={() => console.log('Video can play')}
          />
          
          {/* Placeholder ketika tidak capturing */}
          {!isCapturing && (
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
              // Pastikan ada delay singkat untuk memastikan DOM sudah render
              await new Promise(resolve => setTimeout(resolve, 100));
              
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