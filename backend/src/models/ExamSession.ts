import mongoose, { Schema, Document } from 'mongoose';
import { ExamSession as IExamSession, ProctoringLog } from '../types';

interface ExamSessionDocument extends IExamSession, Document {}

const ProctoringLogSchema: Schema = new Schema({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  eventType: {
    type: String,
    enum: ['face-not-visible', 'multiple-faces', 'mic-activity', 'tab-switch', 'off-screen', 'cheating-detected', 'screenshot-captured'],
    required: true
  },
  details: {
    type: String,
    required: true
  },
  snapshotUrl: {
    type: String,
    required: false
  }
});

const AnswerSchema: Schema = new Schema({
  questionId: {
    type: String,
    required: true
  },
  studentAnswer: {
    type: Schema.Types.Mixed, // Can be string or array
    required: true
  },
  score: {
    type: Number,
    required: false
  }
});

const ExamSessionSchema: Schema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examId: {
    type: Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    enum: ['in-progress', 'submitted', 'cheating-detected', 'logged-out'],
    default: 'in-progress'
  },
  answers: [AnswerSchema],
  proctoringLogs: [ProctoringLogSchema],
  roomScanVideoUrl: {
    type: String,
    required: false
  },
  screenRecordingUrl: {
    type: String,
    required: false
  },
  finalScore: {
    type: Number,
    required: false
  }
}, {
  timestamps: true
});

export default mongoose.model<ExamSessionDocument>('ExamSession', ExamSessionSchema);

