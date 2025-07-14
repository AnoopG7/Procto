import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  startExamSession,
  submitExamSession,
  saveAnswers,
  logProctoringEvent,
  getAllSessions,
  getSessionById,
  getLiveSessions,
  getSessionReports,
  exportSessionLogs
} from '../controllers/examSessionController';

const router = express.Router();

// Student routes
router.post('/start',
  authenticateToken,
  requireRole(['student']),
  [
    body('examId').isMongoId().withMessage('Valid exam ID required')
  ],
  startExamSession
);

router.put('/:id/submit',
  authenticateToken,
  requireRole(['student']),
  [
    param('id').isMongoId().withMessage('Valid session ID required'),
    body('answers').isObject().withMessage('Answers object required')
  ],
  submitExamSession
);

router.put('/:id/save-answers',
  authenticateToken,
  requireRole(['student']),
  [
    param('id').isMongoId().withMessage('Valid session ID required'),
    body('answers').isObject().withMessage('Answers object required')
  ],
  saveAnswers
);

router.post('/:id/log-event',
  authenticateToken,
  requireRole(['student']),
  [
    param('id').isMongoId().withMessage('Valid session ID required'),
    body('eventType').notEmpty().withMessage('Event type required'),
    body('details').notEmpty().withMessage('Event details required')
  ],
  logProctoringEvent
);

// Admin/Teacher routes
router.get('/',
  authenticateToken,
  requireRole(['admin', 'teacher']),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  getAllSessions
);

router.get('/live',
  authenticateToken,
  requireRole(['admin', 'teacher']),
  getLiveSessions
);

router.get('/reports',
  authenticateToken,
  requireRole(['admin', 'teacher']),
  getSessionReports
);

router.get('/:id',
  authenticateToken,
  requireRole(['admin', 'teacher', 'student']),
  [
    param('id').isMongoId().withMessage('Valid session ID required')
  ],
  getSessionById
);

router.get('/:id/export',
  authenticateToken,
  requireRole(['admin', 'teacher']),
  [
    param('id').isMongoId().withMessage('Valid session ID required')
  ],
  exportSessionLogs
);

export default router;

