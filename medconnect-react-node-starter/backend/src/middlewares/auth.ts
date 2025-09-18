import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt.js';

export interface AuthUser {
  id: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  email: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Missing Authorization header' });
  const token = header.replace('Bearer ', '');
  try {
    const user = verifyJwt<AuthUser>(token);
    (req as any).user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
