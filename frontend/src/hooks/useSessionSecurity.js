import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export const useSessionSecurity = (examSessionId = null, onSecurityViolation = null) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [isSecure, setIsSecure] = useState(true);
  const [violations, setViolations] = useState([]);
  const [sessionTimeout, setSessionTimeout] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const inactivityTimeoutRef = useRef(null);
  const securityCheckIntervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const mediaStreamRef = useRef(null);

  // Security configuration
  const SECURITY_CONFIG = {
    maxInactivityTime: 30 * 60 * 1000, // 30 minutes
    sessionTimeoutWarning: 5 * 60 * 1000, // 5 minutes before timeout
    securityCheckInterval: 30 * 1000, // 30 seconds
    maxViolations: 5,
    criticalViolations: ['camera-disabled', 'microphone-disabled', 'network-disconnected']
  };

  // Record security violation
  const recordViolation = useCallback((type, details, severity = 'medium') => {
    const violation = {
      id: Date.now(),
      type,
      details,
      severity,
      timestamp: new Date(),
      sessionId: examSessionId
    };

    setViolations(prev => [...prev, violation]);
    
    // Check if it's a critical violation
    if (SECURITY_CONFIG.criticalViolations.includes(type) || severity === 'critical') {
      handleCriticalViolation(violation);
    }
    
    // Check if max violations reached
    if (violations.length >= SECURITY_CONFIG.maxViolations) {
      handleMaxViolationsReached();
    }
    
    onSecurityViolation?.(violation);
    
    return violation;
  }, [examSessionId, violations.length, onSecurityViolation]);

  // Handle critical security violations
  const handleCriticalViolation = useCallback((violation) => {
    setIsSecure(false);
    
    // Auto-logout for critical violations
    setTimeout(() => {
      logout();
      navigate('/login', { 
        state: { 
          message: `Session terminated due to security violation: ${violation.details}`,
          type: 'security'
        }
      });
    }, 3000);
  }, [logout, navigate]);

  // Handle maximum violations reached
  const handleMaxViolationsReached = useCallback(() => {
    recordViolation('max-violations-reached', 'Maximum security violations exceeded', 'critical');
  }, [recordViolation]);

  // Check camera access
  const checkCameraAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Store reference to check if it gets disabled
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      mediaStreamRef.current = stream;
      
      // Check if video track is enabled
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack || !videoTrack.enabled) {
        recordViolation('camera-disabled', 'Camera access was disabled during exam', 'critical');
        return false;
      }
      
      return true;
    } catch (error) {
      recordViolation('camera-access-denied', 'Camera access was denied or unavailable', 'critical');
      return false;
    }
  }, [recordViolation]);

  // Check microphone access
  const checkMicrophoneAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioTrack = stream.getAudioTracks()[0];
      
      if (!audioTrack || !audioTrack.enabled) {
        recordViolation('microphone-disabled', 'Microphone access was disabled during exam', 'critical');
        stream.getTracks().forEach(track => track.stop());
        return false;
      }
      
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      recordViolation('microphone-access-denied', 'Microphone access was denied or unavailable', 'critical');
      return false;
    }
  }, [recordViolation]);

  // Check network connectivity
  const checkNetworkConnectivity = useCallback(async () => {
    if (!navigator.onLine) {
      recordViolation('network-disconnected', 'Network connection lost during exam', 'critical');
      return false;
    }
    
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        recordViolation('server-unreachable', 'Unable to reach exam server', 'high');
        return false;
      }
      
      return true;
    } catch (error) {
      recordViolation('network-error', 'Network connectivity issues detected', 'high');
      return false;
    }
  }, [recordViolation]);

  // Check browser security features
  const checkBrowserSecurity = useCallback(() => {
    let securityIssues = [];
    
    // Check if developer tools are open (simplified detection)
    const devtools = {
      open: false,
      orientation: null
    };
    
    const threshold = 160;
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          securityIssues.push('Developer tools detected');
        }
      } else {
        devtools.open = false;
      }
    }, 500);
    
    // Check for suspicious extensions or modifications
    if (window.chrome && window.chrome.runtime) {
      // Basic check for Chrome extensions
      securityIssues.push('Browser extensions detected');
    }
    
    if (securityIssues.length > 0) {
      recordViolation('browser-security', `Security issues: ${securityIssues.join(', ')}`, 'medium');
      return false;
    }
    
    return true;
  }, [recordViolation]);

  // Perform comprehensive security check
  const performSecurityCheck = useCallback(async () => {
    const checks = await Promise.all([
      checkCameraAccess(),
      checkMicrophoneAccess(),
      checkNetworkConnectivity()
    ]);
    
    const browserCheck = checkBrowserSecurity();
    const allChecks = [...checks, browserCheck];
    
    const securityStatus = allChecks.every(check => check === true);
    setIsSecure(securityStatus);
    
    return securityStatus;
  }, [checkCameraAccess, checkMicrophoneAccess, checkNetworkConnectivity, checkBrowserSecurity]);

  // Update activity timestamp
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // Reset inactivity timeout
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    
    inactivityTimeoutRef.current = setTimeout(() => {
      recordViolation('inactivity-timeout', 'User inactive for extended period', 'medium');
    }, SECURITY_CONFIG.maxInactivityTime);
  }, [recordViolation]);

  // Start session security monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    
    // Initial security check
    performSecurityCheck();
    
    // Set up periodic security checks
    securityCheckIntervalRef.current = setInterval(
      performSecurityCheck, 
      SECURITY_CONFIG.securityCheckInterval
    );
    
    // Set up activity monitoring
    updateActivity();
    
    // Add activity listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });
    
    console.log('Session security monitoring started');
  }, [isMonitoring, performSecurityCheck, updateActivity]);

  // Stop session security monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    
    if (securityCheckIntervalRef.current) {
      clearInterval(securityCheckIntervalRef.current);
      securityCheckIntervalRef.current = null;
    }
    
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }
    
    // Clean up media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    // Remove activity listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      document.removeEventListener(event, updateActivity, true);
    });
    
    console.log('Session security monitoring stopped');
  }, [updateActivity]);

  // Get security status summary
  const getSecurityStatus = useCallback(() => {
    const criticalViolations = violations.filter(v => v.severity === 'critical').length;
    const highViolations = violations.filter(v => v.severity === 'high').length;
    const mediumViolations = violations.filter(v => v.severity === 'medium').length;
    
    return {
      isSecure,
      totalViolations: violations.length,
      criticalViolations,
      highViolations,
      mediumViolations,
      lastActivity: new Date(lastActivityRef.current),
      isMonitoring,
      riskLevel: criticalViolations > 0 ? 'critical' : 
                 highViolations > 2 ? 'high' :
                 mediumViolations > 3 ? 'medium' : 'low'
    };
  }, [isSecure, violations, isMonitoring]);

  // Force logout with reason
  const forceLogout = useCallback((reason = 'Security violation') => {
    recordViolation('forced-logout', reason, 'critical');
    stopMonitoring();
    
    setTimeout(() => {
      logout();
      navigate('/login', { 
        state: { 
          message: `Session terminated: ${reason}`,
          type: 'security'
        }
      });
    }, 1000);
  }, [recordViolation, stopMonitoring, logout, navigate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    isSecure,
    violations,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    performSecurityCheck,
    getSecurityStatus,
    forceLogout,
    updateActivity
  };
};

