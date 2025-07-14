import { useState, useEffect, useRef, useCallback } from 'react';

export const useAudioMonitoring = (isActive = false, onEvent = null) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioHistory, setAudioHistory] = useState([]);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationFrameRef = useRef(null);
  const silencePeriodRef = useRef(null);
  const lastSpeechTimeRef = useRef(Date.now());

  // Initialize audio monitoring
  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      microphoneRef.current.connect(analyserRef.current);

      return true;
    } catch (error) {
      console.error('Failed to initialize audio monitoring:', error);
      onEvent?.('audio-init-failed', 'Could not access microphone for audio monitoring');
      return false;
    }
  }, [onEvent]);

  // Analyze audio levels
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    const normalizedLevel = average / 255;
    
    setAudioLevel(normalizedLevel);

    // Detect speech (threshold-based)
    const speechThreshold = 0.1; // Adjust based on testing
    const currentTime = Date.now();
    
    if (normalizedLevel > speechThreshold) {
      if (!isSpeaking) {
        setIsSpeaking(true);
        onEvent?.('speech-detected', `Audio activity detected (level: ${(normalizedLevel * 100).toFixed(1)}%)`);
      }
      lastSpeechTimeRef.current = currentTime;
    } else {
      if (isSpeaking && currentTime - lastSpeechTimeRef.current > 2000) { // 2 seconds of silence
        setIsSpeaking(false);
      }
    }

    // Log audio activity
    const audioData = {
      timestamp: currentTime,
      level: normalizedLevel,
      isSpeaking: normalizedLevel > speechThreshold
    };

    setAudioHistory(prev => {
      const newHistory = [...prev, audioData].slice(-100); // Keep last 100 readings
      return newHistory;
    });

    // Check for suspicious audio patterns during exam
    checkSuspiciousAudio(audioData);

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, [isSpeaking, onEvent]);

  // Check for suspicious audio activity
  const checkSuspiciousAudio = useCallback((audioData) => {
    const currentTime = audioData.timestamp;
    
    // Check for unexpected speech during silent periods
    if (audioData.isSpeaking) {
      // Log speech activity (could indicate communication with others)
      onEvent?.('mic-activity', 
        `Microphone activity detected during exam (level: ${(audioData.level * 100).toFixed(1)}%)`
      );
      
      // Clear any existing silence period timer
      if (silencePeriodRef.current) {
        clearTimeout(silencePeriodRef.current);
        silencePeriodRef.current = null;
      }
    } else {
      // Start silence period timer if not already running
      if (!silencePeriodRef.current && isSpeaking) {
        silencePeriodRef.current = setTimeout(() => {
          onEvent?.('silence-period', 'Extended silence period detected');
          silencePeriodRef.current = null;
        }, 30000); // 30 seconds of silence
      }
    }
  }, [isSpeaking, onEvent]);

  // Analyze audio patterns for cheating detection
  const analyzeAudioPatterns = useCallback(() => {
    if (audioHistory.length < 50) return null;

    const recentHistory = audioHistory.slice(-50); // Last 50 readings
    const speechEvents = recentHistory.filter(data => data.isSpeaking);
    const avgLevel = recentHistory.reduce((sum, data) => sum + data.level, 0) / recentHistory.length;
    
    const analysis = {
      suspiciousActivity: false,
      patterns: [],
      confidence: 0,
      metrics: {
        speechPercentage: (speechEvents.length / recentHistory.length) * 100,
        averageLevel: avgLevel,
        speechBursts: 0
      }
    };

    // Count speech bursts (periods of continuous speech)
    let burstCount = 0;
    let inBurst = false;
    
    recentHistory.forEach(data => {
      if (data.isSpeaking && !inBurst) {
        burstCount++;
        inBurst = true;
      } else if (!data.isSpeaking && inBurst) {
        inBurst = false;
      }
    });
    
    analysis.metrics.speechBursts = burstCount;

    // Pattern: Excessive talking
    if (analysis.metrics.speechPercentage > 30) {
      analysis.suspiciousActivity = true;
      analysis.patterns.push('excessive-talking');
      analysis.confidence += 0.4;
    }

    // Pattern: Multiple speech bursts (possible conversation)
    if (analysis.metrics.speechBursts > 5) {
      analysis.suspiciousActivity = true;
      analysis.patterns.push('conversation-pattern');
      analysis.confidence += 0.3;
    }

    // Pattern: Consistent high audio levels (possible background noise/music)
    if (analysis.metrics.averageLevel > 0.2) {
      analysis.suspiciousActivity = true;
      analysis.patterns.push('high-background-audio');
      analysis.confidence += 0.2;
    }

    analysis.confidence = Math.min(analysis.confidence, 1.0);

    if (analysis.suspiciousActivity) {
      onEvent?.('audio-cheating-pattern', 
        `Suspicious audio patterns: ${analysis.patterns.join(', ')} (confidence: ${(analysis.confidence * 100).toFixed(1)}%)`
      );
    }

    return analysis;
  }, [audioHistory, onEvent]);

  // Start audio monitoring
  const startMonitoring = useCallback(async () => {
    if (isMonitoring) return;

    const initialized = await initializeAudio();
    if (!initialized) return;

    setIsMonitoring(true);
    analyzeAudio();
    
    console.log('Audio monitoring started');
  }, [isMonitoring, initializeAudio, analyzeAudio]);

  // Stop audio monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (silencePeriodRef.current) {
      clearTimeout(silencePeriodRef.current);
      silencePeriodRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }
    
    analyserRef.current = null;
    
    console.log('Audio monitoring stopped');
  }, []);

  // Get current audio statistics
  const getAudioStats = useCallback(() => {
    if (audioHistory.length === 0) return null;

    const recentHistory = audioHistory.slice(-100);
    const speechEvents = recentHistory.filter(data => data.isSpeaking);
    
    return {
      currentLevel: audioLevel,
      isSpeaking,
      speechPercentage: (speechEvents.length / recentHistory.length) * 100,
      averageLevel: recentHistory.reduce((sum, data) => sum + data.level, 0) / recentHistory.length,
      totalSamples: audioHistory.length
    };
  }, [audioLevel, isSpeaking, audioHistory]);

  // Auto-start/stop monitoring based on isActive prop
  useEffect(() => {
    if (isActive) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [isActive, startMonitoring, stopMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    isMonitoring,
    audioLevel,
    isSpeaking,
    audioHistory,
    startMonitoring,
    stopMonitoring,
    analyzeAudioPatterns,
    getAudioStats
  };
};

