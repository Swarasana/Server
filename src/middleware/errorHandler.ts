import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle our custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle other known errors
  else if (err.message.includes('not found')) {
    statusCode = 404;
    message = err.message;
  }
  // Handle validation errors from services
  else if (err.message.includes('required')) {
    statusCode = 400;
    message = err.message;
  }
  else {
    // Log unexpected errors
    console.error('Unexpected error:', err);
    message = process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error';
  }

  console.error(`Error ${statusCode}: ${message}`);
  
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};