import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const createExam: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getExams: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getExamById: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateExam: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteExam: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=examController.d.ts.map