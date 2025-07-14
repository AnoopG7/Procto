# Procto - Secure Online Exam Proctoring System

## Overview

Procto is a comprehensive, full-stack web application designed for secure online exam proctoring. It provides real-time monitoring, AI-powered cheating detection, and enterprise-grade security features to ensure academic integrity during remote examinations.

## Features

### 🔐 Authentication & Identity Verification
- **Multi-factor Authentication**: Email/OTP and institution-issued credentials
- **Identity Verification**: Photo and ID card capture before exam starts
- **Role-based Access Control**: Student, Teacher, and Admin roles with appropriate permissions

### 🛡️ Pre-Test Security Checks
- **WebRTC Integration**: Camera and microphone permission verification
- **Network Quality Assessment**: Bandwidth and latency testing
- **360° Room Scan**: Comprehensive environment verification using front camera
- **System Requirements Validation**: Browser compatibility and hardware checks

### 📝 Advanced Exam Interface
- **Distraction-free UI**: Clean, focused design optimized for exam taking
- **Full-screen Enforcement**: Prevents window switching and maintains focus
- **Multiple Question Types**: 
  - Multiple Choice Questions (MCQ)
  - Paragraph/Essay Questions
  - Image-based Questions
  - Secure Code Editor (isolated environment, no internet access)
- **Smart Timer**: Auto-submit on timeout with visual countdown
- **Auto-save Functionality**: 5-second intervals for MCQ, 30-second for others

### 🎯 AI-Powered Proctoring Features
- **Real-time Face Detection**: TensorFlow.js integration for continuous monitoring
- **Audio Analysis**: Microphone activity detection during silence periods
- **Behavioral Pattern Recognition**: Advanced cheating detection algorithms
- **Event Logging**: Timestamped security events with detailed analytics
- **Screenshot Capture**: Periodic snapshots (every 2-5 minutes)
- **Tab Switch Detection**: Immediate alerts for focus violations

### 👨‍💼 Admin & Teacher Dashboard
- **Live Monitoring**: Real-time view of active exam sessions
- **Student Camera Feeds**: Live preview capabilities for administrators
- **Comprehensive Reports**: Filterable performance and behavior analytics
- **Risk Assessment**: AI-powered scoring system for violation detection
- **Data Export**: CSV export functionality for detailed analysis
- **Session Management**: Complete control over exam sessions

### 🔒 Enterprise Security Features
- **Data Encryption**: AES-256-GCM encryption for sensitive information
- **Auto-logout Protection**: Automatic session termination on security violations
- **Network Monitoring**: Real-time connection quality assessment
- **Session Security**: Comprehensive violation tracking and response
- **Secure Storage**: Encrypted logs and snapshots with integrity verification

### 📱 Responsive Design
- **Multi-device Support**: Desktop, tablet, and mobile compatibility
- **Browser Optimization**: Chrome and Edge support without app installation
- **Touch-friendly Interface**: Optimized for various input methods
- **Adaptive UI**: Responsive layouts for different screen sizes

## Technology Stack

### Frontend
- **React.js 18** with TypeScript support
- **Tailwind CSS** for responsive styling
- **shadcn/ui** component library
- **React Router** for navigation
- **Axios** for API communication
- **WebRTC** for camera/microphone access
- **TensorFlow.js** for AI-powered face detection
- **face-api.js** for facial recognition

### Backend
- **Node.js** with Express.js framework
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Socket.io** for real-time communication
- **Multer** for file uploads
- **Express Rate Limiting** for security

### Security & Performance
- **AES-256-GCM** encryption
- **CORS** protection
- **Helmet.js** security headers
- **Rate limiting** and DDoS protection
- **Input validation** and sanitization
- **Secure session management**

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm/pnpm
- MongoDB 5.0+
- Modern web browser (Chrome/Edge recommended)
- Camera and microphone access

### Backend Setup

1. **Clone and Navigate**
   ```bash
   git clone <repository-url>
   cd procto-app/backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/procto
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ENCRYPTION_KEY=your-32-byte-encryption-key-for-data-security
   JWT_EXPIRES_IN=24h
   NODE_ENV=development
   UPLOAD_PATH=./uploads
   ```

4. **Build and Start**
   ```bash
   npm run build
   npm start
   # For development
   npm run dev
   ```

### Frontend Setup

1. **Navigate to Frontend**
   ```bash
   cd ../frontend
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Start Development Server**
   ```bash
   pnpm run dev
   ```

4. **Build for Production**
   ```bash
   pnpm run build
   ```

### Database Setup

1. **Start MongoDB**
   ```bash
   mongod --dbpath /path/to/your/db
   ```

2. **Create Database**
   The application will automatically create the database and collections on first run.

## Usage Guide

### For Students

1. **Registration & Verification**
   - Register with institutional email
   - Complete identity verification with photo and ID
   - Wait for account approval if required

2. **Taking an Exam**
   - Log in and navigate to available exams
   - Complete pre-test security checks
   - Perform 360° room scan
   - Begin exam in secure, monitored environment
   - Submit exam before time expires

3. **During the Exam**
   - Maintain face visibility to camera
   - Avoid tab switching or leaving the exam window
   - Keep microphone enabled for audio monitoring
   - Use only the provided tools and interfaces

### For Teachers

1. **Exam Creation**
   - Log in to teacher dashboard
   - Create new exams with multiple question types
   - Set duration, start/end times, and access windows
   - Configure proctoring settings and security levels

2. **Live Monitoring**
   - View active exam sessions in real-time
   - Monitor student camera feeds and behavior
   - Receive alerts for suspicious activities
   - Take immediate action on violations

3. **Post-Exam Analysis**
   - Review detailed proctoring reports
   - Analyze student performance and behavior patterns
   - Export data for further analysis
   - Grade subjective questions and provide feedback

### For Administrators

1. **System Management**
   - Manage user accounts and permissions
   - Configure system-wide security settings
   - Monitor overall system performance
   - Generate comprehensive analytics reports

2. **Security Oversight**
   - Review flagged sessions and violations
   - Investigate suspicious patterns
   - Implement policy changes and updates
   - Ensure compliance with institutional requirements

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student",
  "institutionId": "inst_123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "student@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student"
  }
}
```

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "student@example.com",
    "role": "student"
  }
}
```

#### POST /api/auth/verify-identity
Upload identity verification documents.

**Request:** Multipart form data with photo and ID card files.

**Response:**
```json
{
  "message": "Identity verification submitted",
  "status": "pending_review"
}
```

### Exam Management Endpoints

#### GET /api/exams
Retrieve available exams for the authenticated user.

**Response:**
```json
{
  "exams": [
    {
      "id": "exam_id",
      "title": "Mathematics Final Exam",
      "description": "Comprehensive mathematics assessment",
      "duration": 120,
      "startTime": "2024-01-15T09:00:00Z",
      "endTime": "2024-01-15T11:00:00Z",
      "questions": [...]
    }
  ]
}
```

#### POST /api/exams
Create a new exam (Teacher/Admin only).

**Request Body:**
```json
{
  "title": "Physics Midterm",
  "description": "Midterm examination for Physics 101",
  "duration": 90,
  "startTime": "2024-01-20T10:00:00Z",
  "endTime": "2024-01-20T11:30:00Z",
  "questions": [
    {
      "type": "MCQ",
      "questionText": "What is the speed of light?",
      "options": ["3x10^8 m/s", "3x10^6 m/s", "3x10^10 m/s", "3x10^4 m/s"],
      "correctAnswer": "3x10^8 m/s",
      "points": 5
    }
  ]
}
```

### Exam Session Endpoints

#### POST /api/exam-sessions/start
Start a new exam session.

**Request Body:**
```json
{
  "examId": "exam_id_here"
}
```

**Response:**
```json
{
  "message": "Exam session started",
  "sessionId": "session_id_here"
}
```

#### PUT /api/exam-sessions/:id/save-answers
Save exam answers (auto-save functionality).

**Request Body:**
```json
{
  "answers": {
    "question_id_1": "answer_1",
    "question_id_2": ["option_a", "option_b"],
    "question_id_3": "Long form answer text..."
  }
}
```

#### POST /api/exam-sessions/:id/log-event
Log proctoring events during exam.

**Request Body:**
```json
{
  "eventType": "face-not-visible",
  "details": "Student face not detected for 10 seconds",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Admin Dashboard Endpoints

#### GET /api/exam-sessions/live
Get currently active exam sessions (Admin/Teacher only).

**Response:**
```json
{
  "sessions": [
    {
      "id": "session_id",
      "studentId": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "examId": {
        "title": "Mathematics Final"
      },
      "startTime": "2024-01-15T09:00:00Z",
      "status": "in-progress",
      "proctoringLogs": [...]
    }
  ]
}
```

#### GET /api/exam-sessions/reports
Get comprehensive session reports with analytics.

**Query Parameters:**
- `examId`: Filter by specific exam
- `flagged`: Show only flagged sessions (true/false)
- `startDate`: Filter sessions from date
- `endDate`: Filter sessions to date

**Response:**
```json
{
  "sessions": [
    {
      "id": "session_id",
      "studentId": {...},
      "examId": {...},
      "analytics": {
        "tabSwitches": 3,
        "faceNotVisible": 2,
        "multipleFaces": 0,
        "micActivity": 1,
        "riskScore": 45,
        "totalViolations": 6
      }
    }
  ]
}
```

## Security Considerations

### Data Protection
- All sensitive data is encrypted using AES-256-GCM
- Passwords are hashed using bcrypt with salt
- JWT tokens have configurable expiration times
- File uploads are validated and sanitized

### Network Security
- HTTPS enforcement in production
- CORS configuration for cross-origin requests
- Rate limiting to prevent abuse
- Input validation and sanitization

### Proctoring Security
- Real-time monitoring with encrypted data transmission
- Secure screenshot storage with integrity verification
- Tamper-evident logging system
- Multi-layered violation detection

### Privacy Compliance
- Minimal data collection principles
- Secure data retention policies
- User consent management
- GDPR/FERPA compliance considerations

## Deployment

### Production Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db/procto
JWT_SECRET=your-production-jwt-secret-256-bits
ENCRYPTION_KEY=your-production-encryption-key-256-bits
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location / {
        root /var/www/procto-frontend;
        try_files $uri $uri/ /index.html;
    }
}
```

## Performance Optimization

### Frontend Optimizations
- Code splitting and lazy loading
- Image compression and progressive loading
- Efficient state management
- Optimized bundle sizes

### Backend Optimizations
- Database indexing and query optimization
- Caching strategies for frequently accessed data
- Connection pooling for database connections
- Efficient file handling and storage

### Network Optimizations
- CDN integration for static assets
- Compression (gzip/brotli) for responses
- HTTP/2 support for improved performance
- Optimized API response structures

## Troubleshooting

### Common Issues

#### Camera/Microphone Access Denied
- Ensure browser permissions are granted
- Check system privacy settings
- Verify HTTPS connection (required for WebRTC)
- Clear browser cache and cookies

#### Network Connection Issues
- Verify internet connectivity
- Check firewall settings
- Ensure WebSocket connections are allowed
- Test with different network configurations

#### Face Detection Not Working
- Ensure adequate lighting conditions
- Position face clearly in camera view
- Check browser compatibility
- Verify TensorFlow.js model loading

#### Performance Issues
- Close unnecessary browser tabs
- Ensure sufficient system resources
- Check network bandwidth requirements
- Update browser to latest version

### Support and Maintenance

#### Monitoring
- Application performance monitoring
- Error tracking and logging
- User activity analytics
- System health checks

#### Updates and Patches
- Regular security updates
- Feature enhancements
- Bug fixes and improvements
- Compatibility updates

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Support

For technical support or questions:
- Email: support@procto-app.com
- Documentation: https://docs.procto-app.com
- Issues: GitHub Issues page

---

**Procto** - Ensuring Academic Integrity in the Digital Age