import { Request, Response, NextFunction } from 'express';
import HttpStatus from 'http-status';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let { status, message } = err;
  if (!(err instanceof ApiError)) {
    status = HttpStatus.INTERNAL_SERVER_ERROR;
    message = 'Internal server error';
    err.isOperational = false;
  }

  logger.error(`Error on ${req.method} ${req.url}: ${message}`, err);

  const isDev = process.env.NODE_ENV !== 'production';

  res.status(status).json({
    error: message,
    ...(isDev && { stack: err.stack, details: err }),
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(ApiError.notFound('Not Found'));
};