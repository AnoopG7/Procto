import { useState, useEffect, useRef, useCallback } from 'react';

export const useNetworkMonitoring = (onNetworkChange = null, onDisconnect = null) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('unknown');
  const [networkQuality, setNetworkQuality] = useState('good');
  const [latency, setLatency] = useState(0);
  const [bandwidth, setBandwidth] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const monitoringIntervalRef = useRef(null);
  const disconnectTimeoutRef = useRef(null);
  const lastOnlineRef = useRef(Date.now());

  // Network quality thresholds
  const QUALITY_THRESHOLDS = {
    excellent: { latency: 50, bandwidth: 10 },
    good: { latency: 150, bandwidth: 5 },
    fair: { latency: 300, bandwidth: 2 },
    poor: { latency: 500, bandwidth: 1 }
  };

  // Detect connection type
  const detectConnectionType = useCallback(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        setConnectionType(connection.effectiveType || connection.type || 'unknown');
        return connection.effectiveType || connection.type;
      }
    }
    return 'unknown';
  }, []);

  // Measure network latency
  const measureLatency = useCallback(async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      const endTime = performance.now();
      
      if (response.ok) {
        const latency = Math.round(endTime - startTime);
        setLatency(latency);
        return latency;
      }
    } catch (error) {
      console.error('Latency measurement failed:', error);
      return 9999; // High latency to indicate poor connection
    }
    return 0;
  }, []);

  // Estimate bandwidth (simplified)
  const estimateBandwidth = useCallback(async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/health', {
        cache: 'no-cache'
      });
      const endTime = performance.now();
      
      if (response.ok) {
        const responseSize = parseInt(response.headers.get('content-length') || '1000');
        const duration = (endTime - startTime) / 1000; // Convert to seconds
        const bandwidth = (responseSize * 8) / (duration * 1024 * 1024); // Mbps
        setBandwidth(Math.round(bandwidth * 100) / 100);
        return bandwidth;
      }
    } catch (error) {
      console.error('Bandwidth estimation failed:', error);
      return 0;
    }
    return 0;
  }, []);

  // Determine network quality based on latency and bandwidth
  const determineNetworkQuality = useCallback((latency, bandwidth) => {
    if (latency <= QUALITY_THRESHOLDS.excellent.latency && bandwidth >= QUALITY_THRESHOLDS.excellent.bandwidth) {
      return 'excellent';
    } else if (latency <= QUALITY_THRESHOLDS.good.latency && bandwidth >= QUALITY_THRESHOLDS.good.bandwidth) {
      return 'good';
    } else if (latency <= QUALITY_THRESHOLDS.fair.latency && bandwidth >= QUALITY_THRESHOLDS.fair.bandwidth) {
      return 'fair';
    } else {
      return 'poor';
    }
  }, []);

  // Perform network quality check
  const checkNetworkQuality = useCallback(async () => {
    if (!isOnline) {
      setNetworkQuality('offline');
      return 'offline';
    }

    try {
      const [measuredLatency, estimatedBandwidth] = await Promise.all([
        measureLatency(),
        estimateBandwidth()
      ]);

      const quality = determineNetworkQuality(measuredLatency, estimatedBandwidth);
      setNetworkQuality(quality);

      // Notify about network changes
      onNetworkChange?.({
        isOnline,
        connectionType: detectConnectionType(),
        quality,
        latency: measuredLatency,
        bandwidth: estimatedBandwidth
      });

      return quality;
    } catch (error) {
      console.error('Network quality check failed:', error);
      setNetworkQuality('poor');
      return 'poor';
    }
  }, [isOnline, measureLatency, estimateBandwidth, determineNetworkQuality, detectConnectionType, onNetworkChange]);

  // Handle online/offline events
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    lastOnlineRef.current = Date.now();
    
    // Clear disconnect timeout
    if (disconnectTimeoutRef.current) {
      clearTimeout(disconnectTimeoutRef.current);
      disconnectTimeoutRef.current = null;
    }
    
    // Check network quality when coming back online
    setTimeout(checkNetworkQuality, 1000);
  }, [checkNetworkQuality]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setNetworkQuality('offline');
    
    // Set timeout for disconnect callback
    disconnectTimeoutRef.current = setTimeout(() => {
      onDisconnect?.({
        disconnectedAt: new Date(),
        lastOnline: new Date(lastOnlineRef.current),
        duration: Date.now() - lastOnlineRef.current
      });
    }, 5000); // 5 seconds offline before triggering disconnect
    
    onNetworkChange?.({
      isOnline: false,
      connectionType: 'none',
      quality: 'offline',
      latency: 0,
      bandwidth: 0
    });
  }, [onNetworkChange, onDisconnect]);

  // Start network monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    
    // Initial check
    checkNetworkQuality();
    
    // Set up periodic monitoring
    monitoringIntervalRef.current = setInterval(checkNetworkQuality, 10000); // Every 10 seconds
    
    console.log('Network monitoring started');
  }, [isMonitoring, checkNetworkQuality]);

  // Stop network monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
    
    if (disconnectTimeoutRef.current) {
      clearTimeout(disconnectTimeoutRef.current);
      disconnectTimeoutRef.current = null;
    }
    
    console.log('Network monitoring stopped');
  }, []);

  // Get network status summary
  const getNetworkStatus = useCallback(() => {
    return {
      isOnline,
      connectionType,
      quality: networkQuality,
      latency,
      bandwidth,
      isMonitoring,
      qualityScore: networkQuality === 'excellent' ? 100 : 
                   networkQuality === 'good' ? 75 :
                   networkQuality === 'fair' ? 50 :
                   networkQuality === 'poor' ? 25 : 0
    };
  }, [isOnline, connectionType, networkQuality, latency, bandwidth, isMonitoring]);

  // Check if network is suitable for exam
  const isNetworkSuitableForExam = useCallback(() => {
    return isOnline && ['excellent', 'good', 'fair'].includes(networkQuality);
  }, [isOnline, networkQuality]);

  // Set up event listeners
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen for connection changes
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        connection.addEventListener('change', detectConnectionType);
      }
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
          connection.removeEventListener('change', detectConnectionType);
        }
      }
    };
  }, [handleOnline, handleOffline, detectConnectionType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    isOnline,
    connectionType,
    networkQuality,
    latency,
    bandwidth,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    checkNetworkQuality,
    getNetworkStatus,
    isNetworkSuitableForExam
  };
};

