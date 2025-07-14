# Procto - Technical Architecture Documentation

## System Architecture Overview

Procto is designed as a modern, scalable web application following microservices principles with a clear separation of concerns. The architecture emphasizes security, real-time monitoring, and performance optimization to deliver a robust online exam proctoring solution.

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │    │   Mobile App    │    │  Admin Panel    │
│   (Students)    │    │   (Students)    │    │ (Teachers/Admin)│
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │     Load Balancer         │
                    │      (Nginx/HAProxy)      │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │     API Gateway           │
                    │   (Rate Limiting, Auth)   │
                    └─────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────┴───────┐    ┌─────────┴───────┐    ┌─────────┴───────┐
│  Frontend App   │    │  Backend API    │    │  WebSocket      │
│   (React.js)    │    │  (Node.js)      │    │   Server        │
└─────────────────┘    └─────────┬───────┘    └─────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │     Database Layer        │
                    └─────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────┴───────┐    ┌─────────┴───────┐    ┌─────────┴───────┐
│    MongoDB      │    │     Redis       │    │  File Storage   │
│   (Primary)     │    │    (Cache)      │    │  (S3/Local)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Frontend Architecture

### Technology Stack
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for responsive styling
- **shadcn/ui** for consistent component library
- **React Router** for client-side routing
- **Axios** for HTTP client with interceptors
- **WebRTC** for camera/microphone access
- **TensorFlow.js** for client-side AI processing
- **Socket.io Client** for real-time communication

### Component Architecture

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── button.jsx
│   │   ├── input.jsx
│   │   ├── card.jsx
│   │   └── alert.jsx
│   ├── auth/                  # Authentication components
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── IdentityVerification.jsx
│   ├── exam/                  # Exam-related components
│   │   ├── PreTestCheck.jsx
│   │   ├── SecureExamInterface.jsx
│   │   └── QuestionComponents/
│   ├── admin/                 # Admin dashboard components
│   │   ├── AdminDashboard.jsx
│   │   ├── LiveMonitor.jsx
│   │   └── SessionReports.jsx
│   └── dashboard/             # Student dashboard
│       └── Dashboard.jsx
├── hooks/                     # Custom React hooks
│   ├── useAuth.js
│   ├── useExamProctoring.js
│   ├── useFaceDetection.js
│   ├── useAudioMonitoring.js
│   ├── useNetworkMonitoring.js
│   └── useSessionSecurity.js
├── lib/                       # Utility libraries
│   ├── api.js                 # API client configuration
│   └── utils.js               # Helper functions
└── App.jsx                    # Main application component
```

### State Management Strategy

The application uses a combination of:
- **React Context** for global state (authentication, user data)
- **Custom Hooks** for feature-specific state management
- **Local Component State** for UI-specific state
- **React Query** (future enhancement) for server state management

### Security Features in Frontend

#### WebRTC Security
```javascript
// Secure media stream handling
const getSecureMediaStream = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    
    // Validate stream integrity
    if (!stream.getVideoTracks().length || !stream.getAudioTracks().length) {
      throw new Error('Required media tracks not available');
    }
    
    return stream;
  } catch (error) {
    throw new Error(`Media access denied: ${error.message}`);
  }
};
```

#### Client-Side Encryption
```javascript
// Encrypt sensitive data before transmission
const encryptSensitiveData = (data, key) => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(data));
  
  return crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: crypto.getRandomValues(new Uint8Array(12)) },
    key,
    dataBuffer
  );
};
```

## Backend Architecture

### Technology Stack
- **Node.js** with Express.js framework
- **TypeScript** for type safety and better development experience
- **MongoDB** with Mongoose ODM for data persistence
- **Redis** for caching and session management
- **Socket.io** for real-time communication
- **JWT** for stateless authentication
- **bcryptjs** for password hashing
- **Multer** for file upload handling

### Service Architecture

```
src/
├── config/
│   ├── database.ts           # Database connection configuration
│   ├── redis.ts              # Redis configuration
│   └── socket.ts             # WebSocket configuration
├── controllers/              # Request handlers
│   ├── authController.ts
│   ├── examController.ts
│   ├── examSessionController.ts
│   └── userController.ts
├── middleware/               # Express middleware
│   ├── auth.ts               # Authentication middleware
│   ├── validation.ts         # Input validation
│   ├── rateLimit.ts          # Rate limiting
│   └── security.ts           # Security headers
├── models/                   # Database models
│   ├── User.ts
│   ├── Exam.ts
│   ├── ExamSession.ts
│   └── ProctoringLog.ts
├── routes/                   # API route definitions
│   ├── auth.ts
│   ├── exams.ts
│   ├── examSessions.ts
│   └── users.ts
├── services/                 # Business logic services
│   ├── authService.ts
│   ├── examService.ts
│   ├── proctoringService.ts
│   └── notificationService.ts
├── utils/                    # Utility functions
│   ├── encryption.ts
│   ├── jwt.ts
│   ├── validation.ts
│   └── logger.ts
├── types/                    # TypeScript type definitions
│   └── index.ts
└── app.ts                    # Main application file
```

### Database Design

#### User Schema
```typescript
interface User {
  _id: ObjectId;
  email: string;                    // Unique identifier
  password: string;                 // Hashed with bcrypt
  role: 'student' | 'teacher' | 'admin';
  institutionId?: string;           // Optional institution association
  firstName: string;
  lastName: string;
  photoUrl?: string;                // Profile photo
  idCardUrl?: string;               // ID verification document
  isVerified: boolean;              // Identity verification status
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Exam Schema
```typescript
interface Exam {
  _id: ObjectId;
  title: string;
  description: string;
  duration: number;                 // Duration in minutes
  startTime: Date;                  // Exam availability window
  endTime: Date;
  questions: Question[];            // Embedded question documents
  createdBy: ObjectId;              // Reference to User (teacher/admin)
  settings: {
    allowedAttempts: number;
    shuffleQuestions: boolean;
    showResults: boolean;
    proctoringEnabled: boolean;
    securityLevel: 'low' | 'medium' | 'high';
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Question {
  _id: ObjectId;
  type: 'MCQ' | 'Paragraph' | 'Image' | 'Code';
  questionText: string;
  options?: string[];               // For MCQ questions
  imageUrl?: string;                // For image-based questions
  correctAnswer?: string | string[]; // For auto-grading
  points: number;
  explanation?: string;             // Optional explanation
}
```

#### ExamSession Schema
```typescript
interface ExamSession {
  _id: ObjectId;
  studentId: ObjectId;              // Reference to User
  examId: ObjectId;                 // Reference to Exam
  startTime: Date;
  endTime?: Date;
  status: 'in-progress' | 'submitted' | 'cheating-detected' | 'logged-out';
  answers: Answer[];
  proctoringLogs: ProctoringLog[];  // Embedded proctoring events
  roomScanVideoUrl?: string;        // Pre-exam room scan
  screenRecordingUrl?: string;      // Optional screen recording
  finalScore?: number;
  gradedBy?: ObjectId;              // Reference to grader
  gradedAt?: Date;
  metadata: {
    browserInfo: string;
    ipAddress: string;
    userAgent: string;
    screenResolution: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Answer {
  questionId: string;
  studentAnswer: string | string[];
  score?: number;
  feedback?: string;
  timeSpent: number;                // Time spent on question (seconds)
}

interface ProctoringLog {
  timestamp: Date;
  eventType: 'face-not-visible' | 'multiple-faces' | 'mic-activity' | 
             'tab-switch' | 'off-screen' | 'cheating-detected' | 'screenshot-captured';
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  snapshotUrl?: string;             // Associated screenshot
  confidence?: number;              // AI confidence score (0-1)
}
```

### API Design Patterns

#### RESTful API Structure
```
GET    /api/auth/profile              # Get current user profile
POST   /api/auth/login               # User authentication
POST   /api/auth/register            # User registration
POST   /api/auth/verify-identity     # Identity verification

GET    /api/exams                    # List available exams
POST   /api/exams                    # Create new exam (teacher/admin)
GET    /api/exams/:id                # Get specific exam
PUT    /api/exams/:id                # Update exam (teacher/admin)
DELETE /api/exams/:id                # Delete exam (admin)

POST   /api/exam-sessions/start      # Start exam session
PUT    /api/exam-sessions/:id/submit # Submit exam
PUT    /api/exam-sessions/:id/save-answers # Auto-save answers
POST   /api/exam-sessions/:id/log-event # Log proctoring event

GET    /api/exam-sessions/live       # Get live sessions (admin/teacher)
GET    /api/exam-sessions/reports    # Get session reports
GET    /api/exam-sessions/:id/export # Export session logs
```

#### Error Handling Strategy
```typescript
interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}

interface APISuccess<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

// Centralized error handler
const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const errorResponse: APIError = {
    success: false,
    error: {
      code: error.name || 'INTERNAL_ERROR',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }
  };

  // Log error for monitoring
  logger.error('API Error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Send appropriate response
  const statusCode = getStatusCode(error);
  res.status(statusCode).json(errorResponse);
};
```

## Real-Time Communication Architecture

### WebSocket Implementation
```typescript
// Socket.io server setup
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Authentication middleware for WebSocket
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

// Real-time event handlers
io.on('connection', (socket) => {
  // Join exam session room
  socket.on('join-exam-session', (sessionId) => {
    socket.join(`session-${sessionId}`);
  });

  // Handle proctoring events
  socket.on('proctoring-event', (data) => {
    // Broadcast to admin monitoring dashboard
    socket.to(`admin-monitor`).emit('proctoring-alert', {
      sessionId: data.sessionId,
      studentId: socket.userId,
      event: data.event,
      timestamp: new Date()
    });
  });

  // Handle exam submission
  socket.on('exam-submitted', (data) => {
    socket.to(`session-${data.sessionId}`).emit('session-ended', {
      reason: 'submitted',
      timestamp: new Date()
    });
  });
});
```

### Event-Driven Architecture
```typescript
// Event emitter for decoupled communication
import { EventEmitter } from 'events';

class ProctoringEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Handle security violations
    this.on('security-violation', async (data) => {
      await this.handleSecurityViolation(data);
    });

    // Handle exam completion
    this.on('exam-completed', async (data) => {
      await this.processExamCompletion(data);
    });

    // Handle suspicious activity
    this.on('suspicious-activity', async (data) => {
      await this.flagSuspiciousActivity(data);
    });
  }

  private async handleSecurityViolation(data: SecurityViolationEvent) {
    // Log violation
    await ProctoringLog.create({
      sessionId: data.sessionId,
      eventType: data.type,
      severity: data.severity,
      details: data.details,
      timestamp: new Date()
    });

    // Notify administrators
    if (data.severity === 'critical') {
      await this.notifyAdministrators(data);
    }

    // Auto-terminate session if needed
    if (data.autoTerminate) {
      await this.terminateSession(data.sessionId, data.reason);
    }
  }
}

export const proctoringEvents = new ProctoringEventEmitter();
```

## AI and Machine Learning Integration

### Face Detection Architecture
```typescript
// Face detection service using TensorFlow.js
import * as faceapi from 'face-api.js';

class FaceDetectionService {
  private isInitialized = false;
  private detectionInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    // Load face detection models
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');

    this.isInitialized = true;
  }

  async startDetection(videoElement: HTMLVideoElement, callback: FaceDetectionCallback) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.detectionInterval = setInterval(async () => {
      try {
        const detections = await faceapi
          .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        const analysisResult = this.analyzeFaceDetections(detections);
        callback(analysisResult);
      } catch (error) {
        console.error('Face detection error:', error);
      }
    }, 10000); // Check every 10 seconds
  }

  private analyzeFaceDetections(detections: any[]): FaceAnalysisResult {
    const result: FaceAnalysisResult = {
      faceCount: detections.length,
      confidence: 0,
      violations: [],
      timestamp: new Date()
    };

    if (detections.length === 0) {
      result.violations.push({
        type: 'face-not-visible',
        severity: 'medium',
        details: 'No face detected in camera feed'
      });
    } else if (detections.length > 1) {
      result.violations.push({
        type: 'multiple-faces',
        severity: 'high',
        details: `${detections.length} faces detected`
      });
    } else {
      // Analyze single face
      const detection = detections[0];
      result.confidence = detection.detection.score;

      // Check for suspicious expressions
      const expressions = detection.expressions;
      if (expressions.surprised > 0.7 || expressions.fearful > 0.6) {
        result.violations.push({
          type: 'suspicious-expression',
          severity: 'low',
          details: 'Unusual facial expression detected'
        });
      }
    }

    return result;
  }

  stopDetection() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
  }
}
```

### Audio Analysis
```typescript
// Audio monitoring service
class AudioMonitoringService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;

  async initialize(stream: MediaStream) {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;

    this.microphone = this.audioContext.createMediaStreamSource(stream);
    this.microphone.connect(this.analyser);
  }

  startMonitoring(callback: AudioAnalysisCallback) {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    this.monitoringInterval = setInterval(() => {
      this.analyser!.getByteFrequencyData(dataArray);
      
      const audioLevel = this.calculateAudioLevel(dataArray);
      const analysis = this.analyzeAudioPattern(dataArray);
      
      callback({
        audioLevel,
        isSpeaking: audioLevel > 0.1,
        analysis,
        timestamp: new Date()
      });
    }, 1000); // Check every second
  }

  private calculateAudioLevel(dataArray: Uint8Array): number {
    const sum = dataArray.reduce((acc, value) => acc + value, 0);
    return sum / (dataArray.length * 255);
  }

  private analyzeAudioPattern(dataArray: Uint8Array): AudioPattern {
    // Analyze frequency patterns to detect:
    // - Multiple voices
    // - Background noise
    // - Music/media playback
    
    const lowFreq = dataArray.slice(0, 10).reduce((a, b) => a + b, 0);
    const midFreq = dataArray.slice(10, 50).reduce((a, b) => a + b, 0);
    const highFreq = dataArray.slice(50, 100).reduce((a, b) => a + b, 0);

    return {
      hasMultipleVoices: this.detectMultipleVoices(dataArray),
      hasBackgroundNoise: lowFreq > midFreq * 1.5,
      hasMusic: this.detectMusicPattern(dataArray),
      dominantFrequency: this.findDominantFrequency(dataArray)
    };
  }
}
```

## Security Architecture

### Authentication and Authorization
```typescript
// JWT-based authentication with refresh tokens
interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class AuthenticationService {
  generateTokenPair(user: User): TokenPair {
    const accessToken = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { 
        id: user._id, 
        tokenVersion: user.tokenVersion 
      },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as any;
      const user = await User.findById(decoded.id);

      if (!user || user.tokenVersion !== decoded.tokenVersion) {
        throw new Error('Invalid refresh token');
      }

      return this.generateAccessToken(user);
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }
}
```

### Data Encryption
```typescript
// AES-256-GCM encryption for sensitive data
import crypto from 'crypto';

class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly secretKey: Buffer;

  constructor() {
    this.secretKey = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  }

  encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedData: EncryptedData): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm, 
      this.secretKey, 
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### Security Middleware Stack
```typescript
// Comprehensive security middleware
const securityMiddleware = [
  // CORS configuration
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }),

  // Security headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "wss:", "https:"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    }
  }),

  // Rate limiting
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Request size limiting
  express.json({ limit: '10mb' }),
  express.urlencoded({ extended: true, limit: '10mb' }),

  // Request logging
  (req: Request, res: Response, next: NextFunction) => {
    logger.info('API Request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    next();
  }
];
```

## Performance Optimization

### Database Optimization
```typescript
// Database connection optimization
const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0
};

// Index optimization
const createIndexes = async () => {
  // User indexes
  await User.collection.createIndex({ email: 1 }, { unique: true });
  await User.collection.createIndex({ role: 1, isVerified: 1 });

  // Exam indexes
  await Exam.collection.createIndex({ createdBy: 1 });
  await Exam.collection.createIndex({ startTime: 1, endTime: 1 });
  await Exam.collection.createIndex({ 'settings.proctoringEnabled': 1 });

  // ExamSession indexes
  await ExamSession.collection.createIndex({ studentId: 1, examId: 1 });
  await ExamSession.collection.createIndex({ status: 1, createdAt: -1 });
  await ExamSession.collection.createIndex({ 'proctoringLogs.eventType': 1 });

  // Compound indexes for complex queries
  await ExamSession.collection.createIndex({
    status: 1,
    'proctoringLogs.severity': 1,
    createdAt: -1
  });
};
```

### Caching Strategy
```typescript
// Redis caching implementation
import Redis from 'redis';

class CacheService {
  private client: Redis.RedisClientType;

  constructor() {
    this.client = Redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache set error', { key, error });
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      logger.error('Cache invalidation error', { pattern, error });
    }
  }
}

// Cache usage in controllers
const examController = {
  async getExam(req: Request, res: Response) {
    const examId = req.params.id;
    const cacheKey = `exam:${examId}`;
    
    // Try cache first
    let exam = await cacheService.get(cacheKey);
    
    if (!exam) {
      // Fetch from database
      exam = await Exam.findById(examId);
      
      // Cache for 1 hour
      await cacheService.set(cacheKey, exam, 3600);
    }
    
    res.json({ exam });
  }
};
```

## Monitoring and Observability

### Application Metrics
```typescript
// Prometheus metrics collection
import prometheus from 'prom-client';

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const activeExamSessions = new prometheus.Gauge({
  name: 'active_exam_sessions_total',
  help: 'Number of currently active exam sessions'
});

const proctoringViolations = new prometheus.Counter({
  name: 'proctoring_violations_total',
  help: 'Total number of proctoring violations',
  labelNames: ['type', 'severity']
});

// Middleware to collect metrics
const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration);
  });
  
  next();
};

// Update active sessions metric
setInterval(async () => {
  const count = await ExamSession.countDocuments({ status: 'in-progress' });
  activeExamSessions.set(count);
}, 30000);
```

### Logging Strategy
```typescript
// Structured logging with Winston
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'procto-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Audit logging for sensitive operations
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/audit.log' })
  ]
});

// Usage in controllers
const logAuditEvent = (action: string, userId: string, details: any) => {
  auditLogger.info('Audit Event', {
    action,
    userId,
    details,
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
};
```

## Scalability Considerations

### Horizontal Scaling
```typescript
// Load balancer configuration (Nginx)
upstream procto_backend {
    least_conn;
    server backend1:5000 weight=3;
    server backend2:5000 weight=3;
    server backend3:5000 weight=2;
    
    # Health checks
    server backend1:5000 max_fails=3 fail_timeout=30s;
    server backend2:5000 max_fails=3 fail_timeout=30s;
    server backend3:5000 max_fails=3 fail_timeout=30s;
}

# Session affinity for WebSocket connections
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    location /socket.io/ {
        proxy_pass http://procto_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        
        # Sticky sessions
        ip_hash;
    }
}
```

### Database Sharding Strategy
```typescript
// MongoDB sharding configuration
// Shard key selection for ExamSession collection
{
  // Shard by studentId for even distribution
  "examSessions": {
    "shardKey": { "studentId": 1, "createdAt": 1 },
    "shardKeyIsUnique": false
  },
  
  // Shard by examId for exam-specific queries
  "proctoringLogs": {
    "shardKey": { "examId": 1, "timestamp": 1 },
    "shardKeyIsUnique": false
  }
}
```

### Microservices Migration Path
```typescript
// Future microservices architecture
interface MicroserviceArchitecture {
  services: {
    authService: {
      responsibilities: ['user authentication', 'authorization', 'identity verification'];
      database: 'users_db';
      port: 3001;
    };
    examService: {
      responsibilities: ['exam management', 'question handling'];
      database: 'exams_db';
      port: 3002;
    };
    proctoringService: {
      responsibilities: ['real-time monitoring', 'AI analysis', 'violation detection'];
      database: 'proctoring_db';
      port: 3003;
    };
    notificationService: {
      responsibilities: ['email notifications', 'real-time alerts'];
      database: 'notifications_db';
      port: 3004;
    };
    fileService: {
      responsibilities: ['file upload', 'media processing', 'storage management'];
      database: 'files_db';
      port: 3005;
    };
  };
  
  communication: {
    synchronous: 'REST APIs with circuit breakers';
    asynchronous: 'Message queues (RabbitMQ/Apache Kafka)';
    realTime: 'WebSocket gateway service';
  };
}
```

This technical architecture documentation provides a comprehensive overview of the Procto application's design, implementation patterns, and scalability considerations. The architecture emphasizes security, performance, and maintainability while providing a solid foundation for future enhancements and scaling requirements.