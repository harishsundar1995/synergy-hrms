import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific MongoDB errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Handle duplicate key errors
  if (err.message.includes('duplicate key error')) {
    statusCode = 409;
    message = 'Resource already exists';
  }

  // Log error details in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🔥 Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        details: err 
      }),
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  });
};
