import { useState, useEffect, useRef, useCallback } from 'react';
import { examSessionAPI } from '../lib/api';

export const useExamProctoring = (examId, sessionId) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [proctoringLogs, setProctoringLogs] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const lastActivityRef = useRef(Date.now());
  const visibilityTimeoutRef = useRef(null);

  // Log proctoring event
  const logEvent = useCallback(async (eventType, details) => {
    const event = {
      timestamp: new Date(),
      eventType,
      details
    };

    setProctoringLogs(prev => [...prev, event]);

    // Send to backend if session exists
    if (sessionId) {
      try {
        await examSessionAPI.logProctoringEvent(sessionId, event);
      } catch (error) {
        console.error('Failed to log proctoring event:', error);
      }
    }
  }, [sessionId]);

  // Fullscreen management
  const enterFullscreen = useCallback(() => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }, []);

  // Tab/Window visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        logEvent('tab-switch', 'Student switched away from exam tab');
        
        // Clear any existing timeout
        if (visibilityTimeoutRef.current) {
          clearTimeout(visibilityTimeoutRef.current);
        }
        
        // Set timeout for extended absence
        visibilityTimeoutRef.current = setTimeout(() => {
          logEvent('off-screen', 'Student away from exam for extended period');
        }, 10000); // 10 seconds
      } else {
        // Clear timeout when returning
        if (visibilityTimeoutRef.current) {
          clearTimeout(visibilityTimeoutRef.current);
          visibilityTimeoutRef.current = null;
        }
        
        if (tabSwitchCount > 0) {
          logEvent('tab-return', 'Student returned to exam tab');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, [logEvent, tabSwitchCount]);

  // Fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
      
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (!isCurrentlyFullscreen && isMonitoring) {
        logEvent('fullscreen-exit', 'Student exited fullscreen mode');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [logEvent, isMonitoring]);

  // Keyboard shortcuts detection
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Detect common cheating shortcuts
      if (event.ctrlKey || event.metaKey) {
        const suspiciousKeys = ['c', 'v', 'a', 't', 'n', 'w', 'r', 'f'];
        if (suspiciousKeys.includes(event.key.toLowerCase())) {
          event.preventDefault();
          logEvent('suspicious-keypress', `Attempted ${event.ctrlKey ? 'Ctrl' : 'Cmd'}+${event.key.toUpperCase()}`);
        }
      }
      
      // Detect F12 (Developer Tools)
      if (event.key === 'F12') {
        event.preventDefault();
        logEvent('suspicious-keypress', 'Attempted to open developer tools');
      }
      
      // Detect Alt+Tab
      if (event.altKey && event.key === 'Tab') {
        event.preventDefault();
        logEvent('suspicious-keypress', 'Attempted Alt+Tab');
      }
    };

    if (isMonitoring) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [logEvent, isMonitoring]);

  // Right-click detection
  useEffect(() => {
    const handleContextMenu = (event) => {
      if (isMonitoring) {
        event.preventDefault();
        logEvent('suspicious-action', 'Attempted right-click');
      }
    };

    if (isMonitoring) {
      document.addEventListener('contextmenu', handleContextMenu);
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [logEvent, isMonitoring]);

  // Mouse activity tracking
  useEffect(() => {
    const handleMouseActivity = () => {
      lastActivityRef.current = Date.now();
    };

    if (isMonitoring) {
      document.addEventListener('mousemove', handleMouseActivity);
      document.addEventListener('click', handleMouseActivity);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseActivity);
      document.removeEventListener('click', handleMouseActivity);
    };
  }, [isMonitoring]);

  // Inactivity detection
  useEffect(() => {
    if (!isMonitoring) return;

    const checkInactivity = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      
      // Log if inactive for more than 2 minutes
      if (timeSinceLastActivity > 120000) {
        logEvent('inactivity', `No activity detected for ${Math.round(timeSinceLastActivity / 1000)} seconds`);
        lastActivityRef.current = Date.now(); // Reset to avoid spam
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInactivity);
  }, [isMonitoring, logEvent]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    enterFullscreen();
    logEvent('monitoring-started', 'Exam proctoring started');
  }, [enterFullscreen, logEvent]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    exitFullscreen();
    logEvent('monitoring-stopped', 'Exam proctoring stopped');
  }, [exitFullscreen, logEvent]);

  // Capture screenshot
  const captureScreenshot = useCallback(async () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // This is a simplified version - in a real implementation,
      // you'd need to capture the actual screen content
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#333';
      ctx.font = '20px Arial';
      ctx.fillText('Screenshot captured at ' + new Date().toLocaleString(), 50, 50);
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.8);
      });
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      return null;
    }
  }, []);

  return {
    isFullscreen,
    isMonitoring,
    tabSwitchCount,
    proctoringLogs,
    startMonitoring,
    stopMonitoring,
    enterFullscreen,
    exitFullscreen,
    logEvent,
    captureScreenshot
  };
};

