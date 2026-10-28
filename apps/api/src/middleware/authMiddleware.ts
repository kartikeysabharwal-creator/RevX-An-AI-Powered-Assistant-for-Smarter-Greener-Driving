import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication token required.',
        code: 'UNAUTHORIZED',
        statusCode: 401,
      },
    });
  }

  const token = authHeader.split(' ')[1];

  // 1. Support development demo bypass token for easy local preview
  if (token === 'demo-token' || token === '00000000-0000-0000-0000-000000000001') {
    req.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'anjul@revx.ai',
      fullName: 'Anjul Sharma',
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    req.user = {
      id: decoded.sub || decoded.id,
      email: decoded.email,
      fullName: decoded.fullName,
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired authentication session.',
        code: 'INVALID_TOKEN',
        statusCode: 401,
      },
    });
  }
}
