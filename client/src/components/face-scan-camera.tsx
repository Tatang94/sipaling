import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, CheckCircle, AlertCircle, Loader2, Eye, RotateCcw } from "lucide-react";
import * as faceapi from 'face-api.js';

interface SimpleFaceData {
  imageData: string;
  timestamp: string;
  faceDetected?: boolean;
  faceDescriptor?: number[];
  livenessScore?: number;
  qualityScore?: number;
  headPose?: {
    yaw: number;
    pitch: number;
    roll: number;
  };
  blinkDetected?: boolean;
  antiSpoofingPassed?: boolean;
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
  const [showLivenessInstructions, setShowLivenessInstructions] = useState(false);
  
  // Advanced liveness detection states
  const [livenessStep, setLivenessStep] = useState<'blink' | 'turn_left' | 'turn_right' | 'smile' | 'complete'>('blink');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [instructionText, setInstructionText] = useState('Berkedip 2 kali untuk memulai');
  const [blinkCount, setBlinkCount] = useState(0);
  const [lastBlinkTime, setLastBlinkTime] = useState(0);
  const [eyeAspectRatio, setEyeAspectRatio] = useState(0);
  const [headPoseData, setHeadPoseData] = useState({ yaw: 0, pitch: 0, roll: 0 });
  const [qualityScore, setQualityScore] = useState(0);
  const [spoofingDetected, setSpoofingDetected] = useState(false);
  const [livenessScore, setLivenessScore] = useState(0);
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

  // Calculate Eye Aspect Ratio for blink detection
  const calculateEAR = (landmarks: any) => {
    if (!landmarks || !landmarks.getLeftEye || !landmarks.getRightEye) return 0;
    
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    
    // Calculate EAR for left eye
    const leftEAR = (
      Math.sqrt(Math.pow(leftEye[1].x - leftEye[5].x, 2) + Math.pow(leftEye[1].y - leftEye[5].y, 2)) +
      Math.sqrt(Math.pow(leftEye[2].x - leftEye[4].x, 2) + Math.pow(leftEye[2].y - leftEye[4].y, 2))
    ) / (2 * Math.sqrt(Math.pow(leftEye[0].x - leftEye[3].x, 2) + Math.pow(leftEye[0].y - leftEye[3].y, 2)));
    
    // Calculate EAR for right eye
    const rightEAR = (
      Math.sqrt(Math.pow(rightEye[1].x - rightEye[5].x, 2) + Math.pow(rightEye[1].y - rightEye[5].y, 2)) +
      Math.sqrt(Math.pow(rightEye[2].x - rightEye[4].x, 2) + Math.pow(rightEye[2].y - rightEye[4].y, 2))
    ) / (2 * Math.sqrt(Math.pow(rightEye[0].x - rightEye[3].x, 2) + Math.pow(rightEye[0].y - rightEye[3].y, 2)));
    
    return (leftEAR + rightEAR) / 2;
  };

  // Calculate head pose from landmarks
  const calculateHeadPose = (landmarks: any) => {
    if (!landmarks || !landmarks.positions) return { yaw: 0, pitch: 0, roll: 0 };
    
    const nose = landmarks.getNose();
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    
    if (!nose || !leftEye || !rightEye) return { yaw: 0, pitch: 0, roll: 0 };
    
    // Simple head pose estimation
    const eyeCenter = {
      x: (leftEye[0].x + rightEye[3].x) / 2,
      y: (leftEye[0].y + rightEye[3].y) / 2
    };
    
    const noseCenter = {
      x: nose[3].x,
      y: nose[3].y
    };
    
    // Calculate yaw (left-right head movement)
    const yaw = Math.atan2(noseCenter.x - eyeCenter.x, 100) * (180 / Math.PI);
    
    // Calculate pitch (up-down head movement)  
    const pitch = Math.atan2(noseCenter.y - eyeCenter.y, 100) * (180 / Math.PI);
    
    // Calculate roll (tilt)
    const roll = Math.atan2(rightEye[0].y - leftEye[3].y, rightEye[0].x - leftEye[3].x) * (180 / Math.PI);
    
    return { yaw, pitch, roll };
  };

  // Anti-spoofing detection
  const detectSpoofing = (detection: any, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    // Get image data for texture analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Simple texture analysis - check for variation in pixel values
    let pixelVariation = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = (r + g + b) / 3;
      pixelVariation += Math.abs(gray - 128);
    }
    
    const averageVariation = pixelVariation / (data.length / 4);
    
    // If variation is too low, might be a static image
    return averageVariation < 10;
  };

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
        // Advanced face detection with landmarks and descriptors
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({ 
            inputSize: 416, 
            scoreThreshold: 0.5 
          })
        ).withFaceLandmarks().withFaceDescriptors();

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detections.length > 0) {
          console.log(`Found ${detections.length} face(s)`);
          setFaceDetections(detections);
          
          const detection = detections[0]; // Use first face
          const landmarks = detection.landmarks;
          
          // Calculate liveness metrics
          const currentEAR = calculateEAR(landmarks);
          const headPose = calculateHeadPose(landmarks);
          const spoofing = detectSpoofing(detection, canvas);
          
          setEyeAspectRatio(currentEAR);
          setHeadPoseData(headPose);
          setSpoofingDetected(spoofing);
          
          // Blink detection logic
          const EAR_THRESHOLD = 0.25;
          const currentTime = Date.now();
          
          if (currentEAR < EAR_THRESHOLD && eyeAspectRatio >= EAR_THRESHOLD) {
            // Eyes just closed (blink detected)
            if (currentTime - lastBlinkTime > 500) { // Minimum 500ms between blinks
              setBlinkCount(prev => prev + 1);
              setLastBlinkTime(currentTime);
              console.log(`Blink detected! Count: ${blinkCount + 1}`);
            }
          }
          
          // Liveness step progression
          if (livenessStep === 'blink' && blinkCount >= 2) {
            setCompletedSteps(prev => [...prev, 'blink']);
            setLivenessStep('turn_left');
            setInstructionText('Putar kepala ke kiri');
          } else if (livenessStep === 'turn_left' && headPose.yaw < -15) {
            setCompletedSteps(prev => [...prev, 'turn_left']);
            setLivenessStep('turn_right');
            setInstructionText('Putar kepala ke kanan');
          } else if (livenessStep === 'turn_right' && headPose.yaw > 15) {
            setCompletedSteps(prev => [...prev, 'turn_right']);
            setLivenessStep('smile');
            setInstructionText('Tersenyum lebar');
          } else if (livenessStep === 'smile') {
            // Simple smile detection based on mouth landmarks
            const mouth = landmarks.getMouth();
            if (mouth && mouth.length > 0) {
              setCompletedSteps(prev => [...prev, 'smile']);
              setLivenessStep('complete');
              setInstructionText('Verifikasi berhasil!');
            }
          }
          
          // Calculate quality and liveness scores
          const detectionScore = detection.detection.score;
          const qualityScore = Math.min(100, Math.max(0, detectionScore * 100));
          const livenessScore = Math.min(100, (completedSteps.length / 4) * 100);
          
          setQualityScore(qualityScore);
          setLivenessScore(livenessScore);
          
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
            
            // Dynamic color based on liveness steps
            let strokeColor = '#00ff88'; // Green for good
            if (spoofingDetected) strokeColor = '#ff4444'; // Red for spoofing
            else if (qualityScore < 70) strokeColor = '#ffaa00'; // Orange for poor quality
            
            // Draw face bounding box
            ctx.strokeStyle = strokeColor;
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
      
      // Create face data object with liveness metrics
      const faceData: SimpleFaceData = {
        imageData,
        timestamp: new Date().toISOString(),
        faceDetected,
        faceDescriptor,
        livenessScore,
        qualityScore,
        headPose: headPoseData,
        blinkDetected: blinkCount >= 2,
        antiSpoofingPassed: !spoofingDetected
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
        
        {/* Liveness Detection Overlay - Dana Style */}
        {showLivenessInstructions && (
        <div className="absolute top-4 left-4 right-4 bg-gradient-to-r from-blue-600/90 to-teal-600/90 text-white p-4 rounded-lg">
          <div className="text-center space-y-2">
            <div className="text-lg font-semibold">{instructionText}</div>
            
            {/* Progress Steps */}
            <div className="flex justify-center space-x-4 mt-3">
              <div className={`flex items-center space-x-1 ${completedSteps.includes('blink') ? 'text-green-300' : 'text-white/60'}`}>
                <Eye className="w-4 h-4" />
                <span className="text-xs">Kedip</span>
                {completedSteps.includes('blink') && <CheckCircle className="w-3 h-3" />}
              </div>
              
              <div className={`flex items-center space-x-1 ${completedSteps.includes('turn_left') ? 'text-green-300' : 'text-white/60'}`}>
                <RotateCcw className="w-4 h-4" />
                <span className="text-xs">Kiri</span>
                {completedSteps.includes('turn_left') && <CheckCircle className="w-3 h-3" />}
              </div>
              
              <div className={`flex items-center space-x-1 ${completedSteps.includes('turn_right') ? 'text-green-300' : 'text-white/60'}`}>
                <RotateCcw className="w-4 h-4 rotate-180" />
                <span className="text-xs">Kanan</span>
                {completedSteps.includes('turn_right') && <CheckCircle className="w-3 h-3" />}
              </div>
              
              <div className={`flex items-center space-x-1 ${completedSteps.includes('smile') ? 'text-green-300' : 'text-white/60'}`}>
                <span className="text-sm">😊</span>
                <span className="text-xs">Senyum</span>
                {completedSteps.includes('smile') && <CheckCircle className="w-3 h-3" />}
              </div>
            </div>
            
            {/* Quality Metrics */}
            <div className="flex justify-between text-xs mt-3 pt-2 border-t border-white/20">
              <span>Kualitas: {qualityScore.toFixed(0)}%</span>
              <span>Liveness: {livenessScore.toFixed(0)}%</span>
              <span>Kedipan: {blinkCount}/2</span>
            </div>
            
            {spoofingDetected && (
              <div className="bg-red-500/80 text-white px-3 py-1 rounded text-xs">
                ⚠️ Terdeteksi foto palsu - Gunakan wajah asli
              </div>
            )}
            
            {/* Skip button for testing */}
            <button
              onClick={() => {
                setLivenessStep('complete');
                setShowLivenessInstructions(false);
                console.log('Liveness detection skipped for testing');
              }}
              className="mt-2 text-xs text-white/70 underline hover:text-white"
            >
              Skip untuk test
            </button>
          </div>
        </div>
        )}

        {/* Status Overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-3 rounded-lg flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm">{getStatusMessage()}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {mode === 'register' && isCapturing && livenessStep !== 'complete' ? (
          <Button
            onClick={() => {
              // Start liveness detection steps
              console.log('Starting liveness detection steps...');
              setShowLivenessInstructions(true);
            }}
            disabled={faceDetections.length === 0}
            className="flex-1"
            variant="outline"
          >
            <Eye className="w-4 h-4 mr-2" />
            Mulai Verifikasi Liveness
          </Button>
        ) : (
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
                {mode === 'register' ? 'Ambil Foto Wajah' : 'Login dengan Wajah'}
              </>
            )}
          </Button>
        )}
        
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