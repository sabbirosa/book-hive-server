import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

export interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  name: string;
  errors?: Record<string, any>;
  keyValue?: Record<string, any>;
}

const errorMiddleware: ErrorRequestHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors: any = {};

    // MongoDB validation error
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation failed';
      errors = {};
      
      if (err.errors) {
        Object.keys(err.errors).forEach(key => {
          errors[key] = err.errors![key].message;
        });
      }
    }

    // MongoDB duplicate key error
    if (err.code === 11000) {
      statusCode = 400;
      message = 'Duplicate field value';
      if (err.keyValue) {
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
        errors = { [field]: `${field} already exists` };
      }
    }

    // MongoDB cast error (invalid ObjectId)
    if (err.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid ID format';
      errors = { id: 'Invalid ID format' };
    }

    // JWT errors (if implemented later)
    if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
      errors = { token: 'Invalid token' };
    }

    if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
      errors = { token: 'Token expired' };
    }

    // Log error for debugging (except validation errors)
    if (statusCode >= 500) {
      console.error('Server Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    }

    res.status(statusCode).json({
      success: false,
      message,
      ...(Object.keys(errors).length > 0 && { errors }),
      ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack })
    });
  } catch (internalError) {
    console.error('Error in error middleware:', internalError);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

export default errorMiddleware;
