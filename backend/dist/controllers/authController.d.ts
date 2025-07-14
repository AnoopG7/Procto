import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const verifyIdentity: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map