import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';

export const useFaceDetection = (webcamRef, isActive = false, onEvent = null) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [lastDetection, setLastDetection] = useState(null);
  const [detectionHistory, setDetectionHistory] = useState([]);
  
  const detectionIntervalRef = useRef(null);
  const screenshotIntervalRef = useRef(null);
  const lastFaceDetectedRef = useRef(Date.now());

  // Load face detection models
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Load models from CDN
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        
        setIsLoaded(true);
        console.log('Face detection models loaded successfully');
      } catch (error) {
        console.error('Failed to load face detection models:', error);
        // Fallback: Set as loaded to continue without face detection
        setIsLoaded(true);
      }
    };

    loadModels();
  }, []);

  // Detect faces in the current video frame
  const detectFaces = useCallback(async () => {
    if (!webcamRef.current || !webcamRef.current.video || !isLoaded) {
      return null;
    }

    const video = webcamRef.current.video;
    
    try {
      // Use tiny face detector for better performance
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      const currentTime = Date.now();
      const detection = {
        timestamp: currentTime,
        faceCount: detections.length,
        faces: detections.map(det => ({
          confidence: det.detection.score,
          box: det.detection.box,
          expressions: det.expressions,
          landmarks: det.landmarks
        }))
      };

      setFaceCount(detections.length);
      setLastDetection(detection);
      
      // Update detection history (keep last 10 detections)
      setDetectionHistory(prev => {
        const newHistory = [...prev, detection].slice(-10);
        return newHistory;
      });

      // Check for suspicious patterns
      if (detections.length === 0) {
        // No face detected
        if (currentTime - lastFaceDetectedRef.current > 5000) { // 5 seconds
          onEvent?.('face-not-visible', 'No face detected for extended period');
        }
      } else if (detections.length > 1) {
        // Multiple faces detected
        onEvent?.('multiple-faces', `${detections.length} faces detected`);
        lastFaceDetectedRef.current = currentTime;
      } else {
        // Single face detected (normal)
        lastFaceDetectedRef.current = currentTime;
        
        // Analyze facial expressions for suspicious behavior
        const face = detections[0];
        const expressions = face.expressions;
        
        // Check if person is looking away (simplified heuristic)
        if (expressions.neutral < 0.3 && expressions.surprised > 0.7) {
          onEvent?.('suspicious-expression', 'Unusual facial expression detected');
        }
      }

      return detection;
    } catch (error) {
      console.error('Face detection error:', error);
      return null;
    }
  }, [webcamRef, isLoaded, onEvent]);

  // Start face detection
  const startDetection = useCallback(() => {
    if (!isLoaded || isDetecting) return;

    setIsDetecting(true);
    
    // Run face detection every 10 seconds
    detectionIntervalRef.current = setInterval(async () => {
      await detectFaces();
    }, 10000);

    // Take screenshots every 2-5 minutes (randomized)
    const scheduleNextScreenshot = () => {
      const delay = Math.random() * (300000 - 120000) + 120000; // 2-5 minutes
      screenshotIntervalRef.current = setTimeout(async () => {
        await captureScreenshot();
        scheduleNextScreenshot();
      }, delay);
    };
    
    scheduleNextScreenshot();
    
    console.log('Face detection started');
  }, [isLoaded, isDetecting, detectFaces]);

  // Stop face detection
  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    if (screenshotIntervalRef.current) {
      clearTimeout(screenshotIntervalRef.current);
      screenshotIntervalRef.current = null;
    }
    
    console.log('Face detection stopped');
  }, []);

  // Capture screenshot from webcam
  const captureScreenshot = useCallback(async () => {
    if (!webcamRef.current) return null;

    try {
      const screenshot = webcamRef.current.getScreenshot();
      const timestamp = new Date().toISOString();
      
      onEvent?.('screenshot-captured', `Screenshot taken at ${timestamp}`, screenshot);
      
      return {
        timestamp,
        dataUrl: screenshot
      };
    } catch (error) {
      console.error('Screenshot capture error:', error);
      return null;
    }
  }, [webcamRef, onEvent]);

  // Manual face detection trigger
  const detectNow = useCallback(async () => {
    return await detectFaces();
  }, [detectFaces]);

  // Analyze detection patterns for cheating behavior
  const analyzePatterns = useCallback(() => {
    if (detectionHistory.length < 5) return null;

    const recentDetections = detectionHistory.slice(-5);
    const noFaceCount = recentDetections.filter(d => d.faceCount === 0).length;
    const multipleFaceCount = recentDetections.filter(d => d.faceCount > 1).length;
    
    const analysis = {
      suspiciousActivity: false,
      patterns: [],
      confidence: 0
    };

    // Pattern: Frequent absence
    if (noFaceCount >= 3) {
      analysis.suspiciousActivity = true;
      analysis.patterns.push('frequent-absence');
      analysis.confidence += 0.3;
    }

    // Pattern: Multiple people
    if (multipleFaceCount >= 2) {
      analysis.suspiciousActivity = true;
      analysis.patterns.push('multiple-people');
      analysis.confidence += 0.5;
    }

    // Pattern: Inconsistent detection
    const faceCountVariance = recentDetections.reduce((acc, d, i, arr) => {
      if (i === 0) return 0;
      return acc + Math.abs(d.faceCount - arr[i-1].faceCount);
    }, 0) / (recentDetections.length - 1);

    if (faceCountVariance > 1) {
      analysis.suspiciousActivity = true;
      analysis.patterns.push('inconsistent-presence');
      analysis.confidence += 0.2;
    }

    analysis.confidence = Math.min(analysis.confidence, 1.0);

    if (analysis.suspiciousActivity) {
      onEvent?.('cheating-pattern-detected', 
        `Suspicious patterns: ${analysis.patterns.join(', ')} (confidence: ${(analysis.confidence * 100).toFixed(1)}%)`
      );
    }

    return analysis;
  }, [detectionHistory, onEvent]);

  // Auto-start/stop detection based on isActive prop
  useEffect(() => {
    if (isActive && isLoaded) {
      startDetection();
    } else {
      stopDetection();
    }

    return () => {
      stopDetection();
    };
  }, [isActive, isLoaded, startDetection, stopDetection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return {
    isLoaded,
    isDetecting,
    faceCount,
    lastDetection,
    detectionHistory,
    startDetection,
    stopDetection,
    detectNow,
    captureScreenshot,
    analyzePatterns
  };
};

