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

  // Handle our custom AppError (includes statusCode property)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle errors with statusCode property (like from notFound middleware)
  else if ((err as any).statusCode) {
    statusCode = (err as any).statusCode;
    message = err.message;
  }
  // Handle PostgreSQL UUID validation errors
  else if (err.message.includes('invalid input syntax for type uuid')) {
    statusCode = 400;
    message = 'Invalid ID format';
  }
  // Handle other database constraint errors
  else if (err.message.includes('violates foreign key constraint')) {
    statusCode = 400;
    message = 'Referenced resource does not exist';
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
    // Log unexpected errors (only log actual 500 errors)
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