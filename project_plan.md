# Procto: Secure Online Exam Proctoring Application - Project Plan

## 1. Project Overview

Procto is a full-stack web application designed to provide secure and reliable online exam proctoring. It aims to ensure academic integrity by monitoring student behavior during online examinations through various technological means, including real-time video and audio analysis, tab-switching detection, and identity verification.

## 2. Core Features and Functional Requirements

As outlined in the initial request, the core features include:

### 2.1. Authentication & Identity Verification:
* Student login via email/OTP or institution-issued credentials.
* Capture student photo and ID card image for verification before test starts.

### 2.2. Pre-Test Checks:
* Checklist screen verifying camera and mic permissions using WebRTC.
* Display network status and minimum bandwidth checks.
* Prompt for 360° room scan using front camera; record and upload video.

### 2.3. Exam Interface:
* Modern, distraction-free UI.
* Full-screen enforced mode.
* Embedded live camera view (small corner).
* Tab-switch detection and warning banners (e.g., “Return to exam tab”).
* Question types: Multiple Choice, Paragraph Answer, and Image-Based Question, also provide a space coding similar to vscode.dev but make sure to keep it local only and not put the user on the internet or any other way which he can escape!.
* Timer with auto-submit on timeout.
* Auto-save every 30 seconds (and 5s for MCQ).

### 2.4. Proctoring Features:
* WebRTC-based face detection (run every 10 seconds).
* Log timestamped events:
  * Face not visible
  * Mic activity during silence periods
  * Tab or window switch
  * Student went off-screen
* Capture snapshots periodically (every 2–5 minutes).
* Save logs and screenshots with exam submission.
* Option to enable/disable screen recording (if browser supports).

### 2.5. Responsive Design:
* Fully responsive layout for desktops, tablets, and Android phones.
* Support Chrome and Edge browsers (no app installation required).

### 2.6. Admin & Teacher Dashboard:
* Schedule exams with access window.
* Live preview of student camera feed.
* Flag-based performance reports: filter by cheating alerts.
* Export behavior logs as CSV.

### 2.7. Security & Performance:
* Encrypted log/snapshot storage.
* Auto logout if camera/mic is disabled or network drops and save the progress.
* Works on low-bandwidth (4G) networks.
* when found cheating end the exam and report to the admin

### 2.8. Advanced Features (Future Considerations):
* AI-based cheating detection patterns.
* Subjective answer auto-grading using NLP.
* LMS integration (via REST APIs).

## 3. Technical Stack

Based on the suggestions and requirements, the following technical stack will be used:

*   **Frontend**: React.js with TypeScript, Tailwind CSS
*   **Backend**: Node.js with Express.js
*   **Database**: MongoDB (for flexibility with schema changes and scalability)
*   **Real-Time**: WebRTC, Socket.io
*   **Face Detection**: TensorFlow.js or face-api.js (to be decided during implementation)
*   **Deployment**: Vercel/Netlify (frontend), Render/Fly.io/Heroku (backend) - (Specific choice to be made during deployment phase)

## 4. Project Structure

```
procto-app/
├── frontend/                 # React.js application
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── utils/
│   │   └── App.tsx
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
└── backend/                  # Node.js/Express.js application
    ├── src/
    │   ├── config/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   ├── routes/
    │   ├── services/
    │   ├── utils/
    │   └── app.ts
    ├── package.json
    ├── tsconfig.json
    └── .env
```

## 5. Database Schema (MongoDB - Initial Draft)

### 5.1. User (Students and Admins/Teachers)
```json
{
  "_id": "ObjectId",
  "email": "String",
  "password": "String" (hashed),
  "role": "String" (e.g., "student", "teacher", "admin"),
  "institutionId": "String" (optional),
  "firstName": "String",
  "lastName": "String",
  "photoUrl": "String" (URL to student's captured photo),
  "idCardUrl": "String" (URL to student's captured ID card image),
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 5.2. Exam
```json
{
  "_id": "ObjectId",
  "title": "String",
  "description": "String",
  "duration": "Number" (minutes),
  "startTime": "Date",
  "endTime": "Date",
  "questions": [
    {
      "type": "String" (e.g., "MCQ", "Paragraph", "Image", "Code"),
      "questionText": "String",
      "options": ["String"] (for MCQ),
      "imageUrl": "String" (for Image-Based),
      "correctAnswer": "String" (for MCQ/Paragraph/Code - expected answer or regex),
      "points": "Number"
    }
  ],
  "createdBy": "ObjectId" (Teacher/Admin ID),
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 5.3. ExamSession
```json
{
  "_id": "ObjectId",
  "studentId": "ObjectId",
  "examId": "ObjectId",
  "startTime": "Date",
  "endTime": "Date" (actual end time),
  "status": "String" (e.g., "in-progress", "submitted", "cheating-detected", "logged-out"),
  "answers": [
    {
      "questionId": "ObjectId",
      "studentAnswer": "String" (or array for MCQ),
      "score": "Number" (for auto-graded questions)
    }
  ],
  "proctoringLogs": [
    {
      "timestamp": "Date",
      "eventType": "String" (e.g., "face-not-visible", "mic-activity", "tab-switch", "off-screen", "cheating-detected"),
      "details": "String" (e.g., "Tab switched to 'Google.com'"),
      "snapshotUrl": "String" (URL to captured snapshot)
    }
  ],
  "roomScanVideoUrl": "String",
  "screenRecordingUrl": "String" (optional),
  "finalScore": "Number",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## 6. API Endpoints (Initial Draft)

### 6.1. Authentication
*   `POST /api/auth/register` (Student/Teacher/Admin registration)
*   `POST /api/auth/login` (Login with email/password)
*   `POST /api/auth/otp-login` (Login with email/OTP)
*   `POST /api/auth/verify-id` (Upload photo and ID card for verification)

### 6.2. Exams
*   `GET /api/exams` (Get all exams)
*   `GET /api/exams/:id` (Get single exam by ID)
*   `POST /api/exams` (Create new exam - Teacher/Admin)
*   `PUT /api/exams/:id` (Update exam - Teacher/Admin)
*   `DELETE /api/exams/:id` (Delete exam - Teacher/Admin)

### 6.3. Exam Sessions
*   `POST /api/exam-sessions/start` (Start a new exam session)
*   `POST /api/exam-sessions/:id/submit` (Submit exam answers)
*   `PUT /api/exam-sessions/:id/answers` (Auto-save answers during exam)
*   `POST /api/exam-sessions/:id/proctoring-log` (Submit proctoring events and snapshots)
*   `POST /api/exam-sessions/:id/room-scan` (Upload room scan video)
*   `GET /api/exam-sessions/:id` (Get exam session details - Admin/Teacher)
*   `GET /api/exam-sessions` (Get all exam sessions - Admin/Teacher)

### 6.4. Admin/Teacher Dashboard
*   `GET /api/dashboard/live-feeds` (Get live camera feeds of ongoing sessions)
*   `GET /api/dashboard/reports` (Get proctoring reports with filtering)
*   `GET /api/dashboard/reports/:id/export-csv` (Export logs as CSV)

## 7. Security Considerations

*   **Authentication**: Implement JWT for secure API authentication. Use strong hashing algorithms (e.g., bcrypt) for passwords.
*   **Data Encryption**: Encrypt sensitive data at rest (e.g., snapshots, logs) and in transit (HTTPS/WSS).
*   **Input Validation**: Strict input validation on all API endpoints to prevent injection attacks.
*   **Rate Limiting**: Implement rate limiting on authentication endpoints to prevent brute-force attacks.
*   **CORS**: Properly configure CORS policies.
*   **Proctoring Data**: Ensure proctoring logs and snapshots are securely stored and only accessible by authorized personnel.

## 8. Performance Considerations

*   **Real-time Data**: Optimize WebRTC and Socket.io for low-latency communication.
*   **Database Indexing**: Implement appropriate database indexing for frequently queried fields.
*   **Scalability**: Design the backend to be scalable to handle a large number of concurrent exam sessions.
*   **Bandwidth Optimization**: Compress and optimize media streams and images to work efficiently on low-bandwidth networks.

## 9. Next Steps

*   Set up the backend Node.js/Express.js project.
*   Implement user authentication and database connection.
*   Develop initial API endpoints for user management and exam creation.


