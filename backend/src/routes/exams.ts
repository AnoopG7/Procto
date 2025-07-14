import express from 'express';
import { body } from 'express-validator';
import { 
  createExam, 
  getExams, 
  getExamById, 
  updateExam, 
  deleteExam 
} from '../controllers/examController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Validation rules
const examValidation = [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required')
];

// Routes
router.post('/', 
  authenticateToken, 
  requireRole(['teacher', 'admin']), 
  examValidation, 
  createExam
);

router.get('/', authenticateToken, getExams);
router.get('/:id', authenticateToken, getExamById);

router.put('/:id', 
  authenticateToken, 
  requireRole(['teacher', 'admin']), 
  examValidation, 
  updateExam
);

router.delete('/:id', 
  authenticateToken, 
  requireRole(['teacher', 'admin']), 
  deleteExam
);

export default router;

