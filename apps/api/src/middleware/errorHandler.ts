import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface AppError extends Error {
  statusCode?: number;
  details?: any;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
  const statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  // Structured observability logging
  console.error(`[Error] [${correlationId}] ${req.method} ${req.originalUrl}:`, {
    message: err.message,
    statusCode,
    stack: isProd ? undefined : err.stack,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'An unexpected internal error occurred.',
      code: err.name || 'INTERNAL_SERVER_ERROR',
      statusCode,
      correlationId,
      details: err.details || null,
    },
  });
}
