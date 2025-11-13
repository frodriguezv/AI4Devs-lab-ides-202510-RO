import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { config } from '../config/app';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Custom error class for API errors
 */
export class AppError extends Error implements ApiError {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'INTERNAL_ERROR';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Formats Zod validation errors
 * Returns a Record<string, string[]> where keys are field paths and values are error messages
 */
function formatZodError(error: ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};
  error.errors.forEach((err) => {
    const field = err.path.join('.');
    if (!details[field]) {
      details[field] = [];
    }
    details[field].push(err.message);
  });
  return details;
}

/**
 * Formats Prisma errors
 */
function formatPrismaError(error: Prisma.PrismaClientKnownRequestError): { code: string; message: string; statusCode: number } {
  switch (error.code) {
    case 'P2002':
      return {
        code: 'UNIQUE_CONSTRAINT_VIOLATION',
        message: 'A record with this value already exists',
        statusCode: 409,
      };
    case 'P2025':
      return {
        code: 'RECORD_NOT_FOUND',
        message: 'Record not found',
        statusCode: 404,
      };
    default:
      return {
        code: 'DATABASE_ERROR',
        message: 'A database error occurred',
        statusCode: 500,
      };
  }
}

/**
 * Global error handler middleware
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log error
  if (config.nodeEnv === 'development') {
    console.error('Error:', err);
  } else {
    // In production, log to a proper logging service
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: formatZodError(err),
      },
    });
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const formatted = formatPrismaError(err);
    return res.status(formatted.statusCode).json({
      success: false,
      error: {
        code: formatted.code,
        message: formatted.message,
      },
    });
  }

  // Handle Prisma client initialization errors (database connection issues)
  if (err instanceof Prisma.PrismaClientInitializationError) {
    const errorMessage = config.nodeEnv === 'development' 
      ? `Database connection error: ${err.message}. Please ensure PostgreSQL is running and DATABASE_URL is correct.`
      : 'Unable to connect to the database. Please try again later.';
    
    return res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_CONNECTION_ERROR',
        message: errorMessage,
      },
    });
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid data provided',
      },
    });
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Handle connection errors that occur during queries
  if (err.message && (
    err.message.includes('Can\'t reach database server') ||
    err.message.includes('Connection') ||
    err.message.includes('ECONNREFUSED') ||
    err.message.includes('P1001') ||
    err.message.includes('P1017')
  )) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_CONNECTION_ERROR',
        message: config.nodeEnv === 'development'
          ? `Database connection error: ${err.message}. Please ensure PostgreSQL is running.`
          : 'Unable to connect to the database. Please try again later.',
      },
    });
  }

  // Handle service errors (string-based error codes)
  if (err.message === 'EMAIL_EXISTS') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'EMAIL_EXISTS',
        message: 'A candidate with this email already exists',
      },
    });
  }

  if (err.message === 'CANDIDATE_NOT_FOUND') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'CANDIDATE_NOT_FOUND',
        message: 'Candidate not found',
      },
    });
  }

  // Default error response
  const statusCode = (err as ApiError).statusCode || 500;
  const message = config.nodeEnv === 'production' ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      code: (err as ApiError).code || 'INTERNAL_ERROR',
      message,
    },
  });
}

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

