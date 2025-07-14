import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const startExamSession: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const submitExamSession: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const saveAnswers: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const logProctoringEvent: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getAllSessions: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getSessionById: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getLiveSessions: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getSessionReports: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const exportSessionLogs: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=examSessionController.d.ts.map