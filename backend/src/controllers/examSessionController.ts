import { Response } from 'express';
import { validationResult } from 'express-validator';
import ExamSession from '../models/ExamSession';
import Exam from '../models/Exam';
import User from '../models/User';
import { AuthenticatedRequest } from '../types';

export const startExamSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { examId } = req.body;

    // Check if exam exists and is available
    const exam = await Exam.findById(examId);
    if (!exam) {
      res.status(404).json({ error: 'Exam not found' });
      return;
    }

    const now = new Date();
    if (now < exam.startTime || now > exam.endTime) {
      res.status(403).json({ error: 'Exam is not currently available' });
      return;
    }

    // Check if student already has an active session
    const existingSession = await ExamSession.findOne({
      studentId: req.user.id,
      examId,
      status: 'in-progress'
    });

    if (existingSession) {
      res.json({
        message: 'Existing session found',
        sessionId: existingSession._id
      });
      return;
    }

    // Create new exam session
    const session = new ExamSession({
      studentId: req.user.id,
      examId,
      startTime: now,
      status: 'in-progress',
      answers: [],
      proctoringLogs: []
    });

    await session.save();

    res.status(201).json({
      message: 'Exam session started',
      sessionId: session._id
    });
  } catch (error) {
    console.error('Start exam session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitExamSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { answers } = req.body;

    const session = await ExamSession.findById(id);
    if (!session) {
      res.status(404).json({ error: 'Exam session not found' });
      return;
    }

    // Verify ownership
    if (session.studentId.toString() !== req.user.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Update session with final answers
    session.answers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      studentAnswer: answer as string | string[]
    }));
    session.endTime = new Date();
    session.status = 'submitted';

    await session.save();

    res.json({
      message: 'Exam submitted successfully',
      session
    });
  } catch (error) {
    console.error('Submit exam session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const saveAnswers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { answers } = req.body;

    const session = await ExamSession.findById(id);
    if (!session) {
      res.status(404).json({ error: 'Exam session not found' });
      return;
    }

    // Verify ownership
    if (session.studentId.toString() !== req.user.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Update answers
    session.answers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      studentAnswer: answer as string | string[]
    }));

    await session.save();

    res.json({ message: 'Answers saved successfully' });
  } catch (error) {
    console.error('Save answers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logProctoringEvent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { eventType, details, timestamp } = req.body;

    const session = await ExamSession.findById(id);
    if (!session) {
      res.status(404).json({ error: 'Exam session not found' });
      return;
    }

    // Verify ownership
    if (session.studentId.toString() !== req.user.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Add proctoring log
    session.proctoringLogs.push({
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      eventType,
      details
    });

    await session.save();

    res.json({ message: 'Proctoring event logged' });
  } catch (error) {
    console.error('Log proctoring event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin/Teacher endpoints
export const getAllSessions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { examId, status, page = 1, limit = 20 } = req.query;
    
    let query: any = {};
    
    // If teacher, only show sessions for their exams
    if (req.user.role === 'teacher') {
      const teacherExams = await Exam.find({ createdBy: req.user.id }).select('_id');
      const examIds = teacherExams.map(exam => exam._id);
      query.examId = { $in: examIds };
    }
    
    if (examId) {
      query.examId = examId;
    }
    
    if (status) {
      query.status = status;
    }

    const sessions = await ExamSession.find(query)
      .populate('studentId', 'firstName lastName email')
      .populate('examId', 'title description')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await ExamSession.countDocuments(query);

    res.json({
      sessions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get all sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSessionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    const session = await ExamSession.findById(id)
      .populate('studentId', 'firstName lastName email photoUrl')
      .populate('examId', 'title description questions');

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Check permissions
    if (req.user.role === 'teacher') {
      const exam = await Exam.findById(session.examId);
      if (!exam || exam.createdBy.toString() !== req.user.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    } else if (req.user.role === 'student' && session.studentId.toString() !== req.user.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ session });
  } catch (error) {
    console.error('Get session by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLiveSessions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    let query: any = { status: 'in-progress' };
    
    // If teacher, only show sessions for their exams
    if (req.user.role === 'teacher') {
      const teacherExams = await Exam.find({ createdBy: req.user.id }).select('_id');
      const examIds = teacherExams.map(exam => exam._id);
      query.examId = { $in: examIds };
    }

    const sessions = await ExamSession.find(query)
      .populate('studentId', 'firstName lastName email photoUrl')
      .populate('examId', 'title')
      .sort({ startTime: -1 });

    res.json({ sessions });
  } catch (error) {
    console.error('Get live sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSessionReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { examId, flagged, startDate, endDate } = req.query;
    
    let query: any = {};
    
    // If teacher, only show sessions for their exams
    if (req.user.role === 'teacher') {
      const teacherExams = await Exam.find({ createdBy: req.user.id }).select('_id');
      const examIds = teacherExams.map(exam => exam._id);
      query.examId = { $in: examIds };
    }
    
    if (examId) {
      query.examId = examId;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    let sessions = await ExamSession.find(query)
      .populate('studentId', 'firstName lastName email')
      .populate('examId', 'title')
      .sort({ createdAt: -1 });

    // Filter flagged sessions if requested
    if (flagged === 'true') {
      sessions = sessions.filter(session => {
        const suspiciousEvents = session.proctoringLogs.filter(log => 
          ['face-not-visible', 'multiple-faces', 'tab-switch', 'cheating-detected', 'mic-activity'].includes(log.eventType)
        );
        return suspiciousEvents.length > 0;
      });
    }

    // Add analytics
    const analytics = sessions.map(session => {
      const logs = session.proctoringLogs;
      const tabSwitches = logs.filter(log => log.eventType === 'tab-switch').length;
      const faceNotVisible = logs.filter(log => log.eventType === 'face-not-visible').length;
      const multipleFaces = logs.filter(log => log.eventType === 'multiple-faces' || log.eventType === 'cheating-detected').length;
      const micActivity = logs.filter(log => log.eventType === 'mic-activity').length;
      
      const riskScore = Math.min(
        (tabSwitches * 0.2) + 
        (faceNotVisible * 0.3) + 
        (multipleFaces * 0.4) + 
        (micActivity * 0.1), 
        1.0
      );

      return {
        ...session.toObject(),
        analytics: {
          tabSwitches,
          faceNotVisible,
          multipleFaces,
          micActivity,
          riskScore: Math.round(riskScore * 100),
          totalViolations: tabSwitches + faceNotVisible + multipleFaces + micActivity
        }
      };
    });

    res.json({ sessions: analytics });
  } catch (error) {
    console.error('Get session reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const exportSessionLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    const session = await ExamSession.findById(id)
      .populate('studentId', 'firstName lastName email')
      .populate('examId', 'title');

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Check permissions
    if (req.user.role === 'teacher') {
      const exam = await Exam.findById(session.examId);
      if (!exam || exam.createdBy.toString() !== req.user.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    }

    // Generate CSV content
    const csvHeader = 'Timestamp,Event Type,Details\n';
    const csvRows = session.proctoringLogs.map(log => 
      `"${log.timestamp.toISOString()}","${log.eventType}","${log.details.replace(/"/g, '""')}"`
    ).join('\n');
    
    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="session-${session._id}-logs.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export session logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

