import mongoose, { Schema, Document } from 'mongoose';
import { Exam as IExam, Question } from '../types';

interface ExamDocument extends IExam, Document {}

const QuestionSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ['MCQ', 'Paragraph', 'Image', 'Code'],
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  options: [{
    type: String
  }],
  imageUrl: {
    type: String,
    required: false
  },
  correctAnswer: {
    type: String,
    required: false
  },
  points: {
    type: Number,
    required: true,
    default: 1
  }
});

const ExamSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true // in minutes
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  questions: [QuestionSchema],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<ExamDocument>('Exam', ExamSchema);

