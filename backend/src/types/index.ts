import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface User {
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  institutionId?: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  idCardUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  type: 'MCQ' | 'Paragraph' | 'Image' | 'Code';
  questionText: string;
  options?: string[];
  imageUrl?: string;
  correctAnswer?: string;
  points: number;
}

export interface Exam {
  title: string;
  description: string;
  duration: number; // in minutes
  startTime: Date;
  endTime: Date;
  questions: Question[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProctoringLog {
  timestamp: Date;
  eventType: 'face-not-visible' | 'multiple-faces' | 'mic-activity' | 'tab-switch' | 'off-screen' | 'cheating-detected' | 'screenshot-captured';
  details: string;
  snapshotUrl?: string;
}

export interface ExamSession {
  studentId: string;
  examId: string;
  startTime: Date;
  endTime?: Date;
  status: 'in-progress' | 'submitted' | 'cheating-detected' | 'logged-out';
  answers: Array<{
    questionId: string;
    studentAnswer: string | string[];
    score?: number;
  }>;
  proctoringLogs: ProctoringLog[];
  roomScanVideoUrl?: string;
  screenRecordingUrl?: string;
  finalScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

