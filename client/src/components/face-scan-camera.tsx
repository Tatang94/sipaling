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
        // Simple face detection optimized for free version
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({ 
            inputSize: 320, 
            scoreThreshold: 0.3 
          })
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
          detections.forEach((detection: any) => {
            const box = detection.detection ? detection.detection.box : detection.box;
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
            
            // Draw simple face indicators for better performance
            // Add corner indicators showing face is detected
            const cornerSize = 30;
            const cornerThickness = 4;
            
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = cornerThickness;
            
            // Top-left corner
            ctx.beginPath();
            ctx.moveTo(scaledBox.x, scaledBox.y + cornerSize);
            ctx.lineTo(scaledBox.x, scaledBox.y);
            ctx.lineTo(scaledBox.x + cornerSize, scaledBox.y);
            ctx.stroke();
            
            // Top-right corner
            ctx.beginPath();
            ctx.moveTo(scaledBox.x + scaledBox.width - cornerSize, scaledBox.y);
            ctx.lineTo(scaledBox.x + scaledBox.width, scaledBox.y);
            ctx.lineTo(scaledBox.x + scaledBox.width, scaledBox.y + cornerSize);
            ctx.stroke();
            
            // Bottom-left corner
            ctx.beginPath();
            ctx.moveTo(scaledBox.x, scaledBox.y + scaledBox.height - cornerSize);
            ctx.lineTo(scaledBox.x, scaledBox.y + scaledBox.height);
            ctx.lineTo(scaledBox.x + cornerSize, scaledBox.y + scaledBox.height);
            ctx.stroke();
            
            // Bottom-right corner
            ctx.beginPath();
            ctx.moveTo(scaledBox.x + scaledBox.width - cornerSize, scaledBox.y + scaledBox.height);
            ctx.lineTo(scaledBox.x + scaledBox.width, scaledBox.y + scaledBox.height);
            ctx.lineTo(scaledBox.x + scaledBox.width, scaledBox.y + scaledBox.height - cornerSize);
            ctx.stroke();
            
            // Try to draw landmarks if available (optimized for free version)
            if (landmarks && landmarks.positions) {
              try {
                ctx.fillStyle = '#00ff88';
                ctx.strokeStyle = '#00ff88';
                ctx.lineWidth = 2;
                
                // Scale landmark points
                const points = landmarks.positions.map((point: any) => ({
                  x: point.x * scaleX,
                  y: point.y * scaleY
                }));
                
                // Draw simplified facial features
                // Eyes (simplified circles)
                if (points.length >= 48) {
                  const leftEyeCenter = points[39]; // Approximate left eye center
                  const rightEyeCenter = points[42]; // Approximate right eye center
                  
                  ctx.beginPath();
                  ctx.arc(leftEyeCenter.x, leftEyeCenter.y, 8, 0, 2 * Math.PI);
                  ctx.stroke();
                  
                  ctx.beginPath();
                  ctx.arc(rightEyeCenter.x, rightEyeCenter.y, 8, 0, 2 * Math.PI);
                  ctx.stroke();
                }
                
                // Nose (simple line)
                if (points.length >= 36) {
                  const noseTop = points[27];
                  const noseBottom = points[33];
                  
                  ctx.beginPath();
                  ctx.moveTo(noseTop.x, noseTop.y);
                  ctx.lineTo(noseBottom.x, noseBottom.y);
                  ctx.stroke();
                }
                
                // Mouth (simple arc)
                if (points.length >= 68) {
                  const mouthLeft = points[48];
                  const mouthRight = points[54];
                  const mouthCenter = points[51];
                  
                  ctx.beginPath();
                  ctx.moveTo(mouthLeft.x, mouthLeft.y);
                  ctx.quadraticCurveTo(mouthCenter.x, mouthCenter.y + 5, mouthRight.x, mouthRight.y);
                  ctx.stroke();
                }
                
              } catch (landmarkError) {
                console.log('Landmark drawing failed, using simple detection');
              }
            } else {
              // Fallback: Draw simple estimated features based on face box
              const centerX = scaledBox.x + scaledBox.width / 2;
              const centerY = scaledBox.y + scaledBox.height / 2;
              const eyeY = scaledBox.y + scaledBox.height * 0.35;
              const noseY = scaledBox.y + scaledBox.height * 0.55;
              const mouthY = scaledBox.y + scaledBox.height * 0.75;
              
              ctx.strokeStyle = '#00ff88';
              ctx.lineWidth = 2;
              
              // Estimated eyes
              ctx.beginPath();
              ctx.arc(centerX - scaledBox.width * 0.2, eyeY, 6, 0, 2 * Math.PI);
              ctx.stroke();
              
              ctx.beginPath();
              ctx.arc(centerX + scaledBox.width * 0.2, eyeY, 6, 0, 2 * Math.PI);
              ctx.stroke();
              
              // Estimated nose
              ctx.beginPath();
              ctx.moveTo(centerX, noseY - 10);
              ctx.lineTo(centerX, noseY + 10);
              ctx.stroke();
              
              // Estimated mouth
              ctx.beginPath();
              ctx.arc(centerX, mouthY, scaledBox.width * 0.15, 0, Math.PI);
              ctx.stroke();
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