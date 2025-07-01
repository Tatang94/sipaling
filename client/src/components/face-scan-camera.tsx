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

interface FaceScanCameraProps {
  onCapture: (faceData: SimpleFaceData) => void;
  onError: (error: string) => void;
  mode: 'register' | 'login';
  isProcessing?: boolean;
  className?: string;
}

export function FaceScanCamera({ 
  onCapture, 
  onError, 
  mode, 
  isProcessing = false,
  className = ""
}: FaceScanCameraProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureStep, setCaptureStep] = useState<'ready' | 'loading' | 'capturing' | 'processing' | 'success' | 'failed'>('ready');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetections, setFaceDetections] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load face-api.js models
  const loadModels = useCallback(async () => {
    try {
      setCaptureStep('loading');
      console.log('Loading face-api.js models...');
      
      const MODEL_URL = '/models';
      
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
      
      video.srcObject = stream;
      streamRef.current = stream;
      
      video.onloadedmetadata = () => {
        console.log('Video metadata loaded');
        video.play();
      };
      
      video.oncanplay = () => {
        console.log('Video can play');
        setIsCapturing(true);
        startFaceDetection();
      };
      
      video.onplaying = () => {
        console.log('Video playing successfully');
        setIsScanning(true);
      };
      
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      onError(`Tidak dapat mengakses kamera: ${error.message}`);
    }
  }, [onError]);

  const startFaceDetection = useCallback(() => {
    if (!modelsLoaded || !videoRef.current || !overlayCanvasRef.current) return;

    const video = videoRef.current;
    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas size to match video display size
    const rect = video.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    const detectFaces = async () => {
      if (!video || video.paused || video.ended) return;

      try {
        // Detect faces with landmarks
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceDescriptors();

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detections.length > 0) {
          console.log(`Found ${detections.length} face(s)`);
          setFaceDetections(detections);
          
          // Calculate scaling factors
          const scaleX = canvas.width / video.videoWidth;
          const scaleY = canvas.height / video.videoHeight;
          
          // Draw face detection overlay
          detections.forEach((detection) => {
            const box = detection.detection.box;
            const landmarks = detection.landmarks;
            
            // Scale coordinates to match canvas size
            const scaledBox = {
              x: box.x * scaleX,
              y: box.y * scaleY,
              width: box.width * scaleX,
              height: box.height * scaleY
            };
            
            // Draw face bounding box with bright green
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 3;
            ctx.strokeRect(scaledBox.x, scaledBox.y, scaledBox.width, scaledBox.height);
            
            // Draw face landmarks (facial features)
            if (landmarks) {
              ctx.fillStyle = '#00ff88';
              ctx.strokeStyle = '#00ff88';
              ctx.lineWidth = 2;
              
              // Scale landmark points
              const points = landmarks.positions.map(point => ({
                x: point.x * scaleX,
                y: point.y * scaleY
              }));
              
              // Draw face outline (jawline)
              ctx.beginPath();
              const faceOutline = points.slice(0, 17);
              ctx.moveTo(faceOutline[0].x, faceOutline[0].y);
              for (let i = 1; i < faceOutline.length; i++) {
                ctx.lineTo(faceOutline[i].x, faceOutline[i].y);
              }
              ctx.stroke();
              
              // Draw eyebrows
              const leftEyebrow = points.slice(17, 22);
              const rightEyebrow = points.slice(22, 27);
              
              ctx.beginPath();
              ctx.moveTo(leftEyebrow[0].x, leftEyebrow[0].y);
              for (let i = 1; i < leftEyebrow.length; i++) {
                ctx.lineTo(leftEyebrow[i].x, leftEyebrow[i].y);
              }
              ctx.stroke();
              
              ctx.beginPath();
              ctx.moveTo(rightEyebrow[0].x, rightEyebrow[0].y);
              for (let i = 1; i < rightEyebrow.length; i++) {
                ctx.lineTo(rightEyebrow[i].x, rightEyebrow[i].y);
              }
              ctx.stroke();
              
              // Draw nose bridge and nose
              const nose = points.slice(27, 36);
              ctx.beginPath();
              ctx.moveTo(nose[0].x, nose[0].y);
              for (let i = 1; i < nose.length; i++) {
                ctx.lineTo(nose[i].x, nose[i].y);
              }
              ctx.stroke();
              
              // Draw left eye
              const leftEye = points.slice(36, 42);
              ctx.beginPath();
              ctx.moveTo(leftEye[0].x, leftEye[0].y);
              for (let i = 1; i < leftEye.length; i++) {
                ctx.lineTo(leftEye[i].x, leftEye[i].y);
              }
              ctx.closePath();
              ctx.stroke();
              
              // Draw right eye
              const rightEye = points.slice(42, 48);
              ctx.beginPath();
              ctx.moveTo(rightEye[0].x, rightEye[0].y);
              for (let i = 1; i < rightEye.length; i++) {
                ctx.lineTo(rightEye[i].x, rightEye[i].y);
              }
              ctx.closePath();
              ctx.stroke();
              
              // Draw outer mouth
              const outerMouth = points.slice(48, 60);
              ctx.beginPath();
              ctx.moveTo(outerMouth[0].x, outerMouth[0].y);
              for (let i = 1; i < outerMouth.length; i++) {
                ctx.lineTo(outerMouth[i].x, outerMouth[i].y);
              }
              ctx.closePath();
              ctx.stroke();
              
              // Draw inner mouth
              const innerMouth = points.slice(60, 68);
              if (innerMouth.length > 0) {
                ctx.beginPath();
                ctx.moveTo(innerMouth[0].x, innerMouth[0].y);
                for (let i = 1; i < innerMouth.length; i++) {
                  ctx.lineTo(innerMouth[i].x, innerMouth[i].y);
                }
                ctx.closePath();
                ctx.stroke();
              }
            }
          });
        } else {
          setFaceDetections([]);
        }
      } catch (error) {
        console.error('Face detection error:', error);
      }
    };

    // Start detection loop
    detectionIntervalRef.current = setInterval(detectFaces, 100);
  }, [modelsLoaded]);

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
    setIsScanning(false);
    setFaceDetections([]);
  }, []);

  const captureFace = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || captureStep === 'processing') return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    setCaptureStep('processing');
    
    try {
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      let faceDescriptor: number[] | undefined;
      let faceDetected = false;
      
      if (modelsLoaded && faceDetections.length > 0) {
        console.log('Detecting faces...');
        
        // Use the latest face detection data
        const detection = faceDetections[0];
        if (detection && detection.descriptor) {
          faceDescriptor = Array.from(detection.descriptor);
          faceDetected = true;
          console.log('Foto berhasil diambil', 'dengan deteksi wajah');
        }
      }
      
      // Create face data object
      const faceData: SimpleFaceData = {
        imageData,
        timestamp: new Date().toISOString(),
        faceDetected,
        faceDescriptor
      };
      
      setCaptureStep('success');
      
      // Call the capture callback
      onCapture(faceData);
      
      // Reset state after a short delay
      setTimeout(() => {
        setCaptureStep('ready');
      }, 1000);
      
    } catch (error: any) {
      console.error('Error capturing face:', error);
      setCaptureStep('failed');
      onError(`Gagal mengambil foto: ${error.message}`);
      
      setTimeout(() => {
        setCaptureStep('ready');
      }, 2000);
    }
  }, [faceDetections, modelsLoaded, onCapture, onError, captureStep]);

  // Initialize models and camera on component mount
  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
    };
  }, [loadModels, stopCamera]);

  // Start camera when models are loaded
  useEffect(() => {
    if (modelsLoaded && captureStep === 'ready' && !isCapturing) {
      startCamera();
    }
  }, [modelsLoaded, captureStep, isCapturing, startCamera]);

  const getStatusMessage = () => {
    switch (captureStep) {
      case 'loading':
        return 'Memuat model AI...';
      case 'capturing':
        return 'Menghubungkan kamera...';
      case 'processing':
        return 'Memproses wajah...';
      case 'success':
        return 'Wajah berhasil dideteksi!';
      case 'failed':
        return 'Gagal mendeteksi wajah';
      default:
        return isScanning ? 
          (faceDetections.length > 0 ? 'Wajah terdeteksi - Siap mengambil foto' : 'Posisikan wajah Anda di dalam frame') : 
          'Mempersiapkan kamera...';
    }
  };

  const getStatusIcon = () => {
    switch (captureStep) {
      case 'loading':
      case 'capturing':
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return faceDetections.length > 0 ? 
          <CheckCircle className="w-5 h-5 text-green-500" /> : 
          <Camera className="w-5 h-5" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Camera Container */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-auto max-h-80 object-cover"
          playsInline
          muted
          autoPlay
        />
        
        {/* Face Detection Overlay */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        />
        
        {/* Hidden canvas for capture */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />
        
        {/* Status Overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-3 rounded-lg flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm">{getStatusMessage()}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          onClick={captureFace}
          disabled={!isCapturing || captureStep === 'processing' || isProcessing}
          className="flex-1"
          variant={faceDetections.length > 0 ? "default" : "secondary"}
        >
          {captureStep === 'processing' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              {mode === 'register' ? 'Ambil Foto Wajah' : 'Verifikasi Wajah'}
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={stopCamera}
          disabled={!isCapturing}
        >
          <CameraOff className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}