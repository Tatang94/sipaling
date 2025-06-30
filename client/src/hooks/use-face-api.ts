import { useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

export interface FaceDescriptor {
  descriptor: Float32Array;
  confidence: number;
}

export function useFaceApi() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        // Load face-api.js models from CDN
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        
        setIsLoaded(true);
      } catch (err) {
        setError('Gagal memuat model Face API');
        console.error('Error loading face-api models:', err);
      }
    };

    loadModels();
  }, []);

  const detectFace = async (imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<FaceDescriptor | null> => {
    if (!isLoaded) return null;

    try {
      const detection = await faceapi
        .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) return null;

      return {
        descriptor: detection.descriptor,
        confidence: detection.detection.score
      };
    } catch (err) {
      console.error('Error detecting face:', err);
      return null;
    }
  };

  const compareFaces = (face1: FaceDescriptor, face2: FaceDescriptor): number => {
    if (!isLoaded) return 1;
    
    // Calculate euclidean distance between face descriptors
    return faceapi.euclideanDistance(face1.descriptor, face2.descriptor);
  };

  const isSamePerson = (face1: FaceDescriptor, face2: FaceDescriptor, threshold: number = 0.6): boolean => {
    const distance = compareFaces(face1, face2);
    return distance < threshold;
  };

  return {
    isLoaded,
    error,
    detectFace,
    compareFaces,
    isSamePerson
  };
}