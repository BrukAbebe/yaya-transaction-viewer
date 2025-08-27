import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiError } from '../utils/ApiError';
import { SearchRequest } from '../types';

// Define the pagination schema
const paginationSchema = z.object({
  p: z.coerce.number().int().min(1).optional().default(1),
});

// Define the search schema
const searchSchema = z
  .object({
    id: z.string().trim().max(100, 'ID must not exceed 100 characters').optional(),
    senderAccount: z
      .string()
      
      .max(100, 'Sender account must not exceed 100 characters')
      .optional(),
    receiverAccount: z
      .string()
      .trim()
      .max(100, 'Receiver account must not exceed 100 characters')
      .optional(),
    cause: z.string().trim().max(100, 'Cause must not exceed 100 characters').optional(),
  })
  .refine(
    (data) => Object.values(data).some((val) => val !== undefined && val !== ''),
    { message: 'At least one search field must be provided' }
  );

// Extend Request interface to include locals
interface RequestWithLocals extends Request {
  locals?: {
    page?: number;
  };
}

// Validate pagination query parameter
export const validatePagination = (
  req: RequestWithLocals,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = paginationSchema.parse(req.query);
    req.locals = req.locals || {};
    req.locals.page = result.p; // Store validated page number in req.locals
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((e) => e.message).join(', ');
      next(ApiError.badRequest(message));
    } else {
      next(error);
    }
  }
};

// Validate search query body
export const validateSearchQuery = (
  req: Request<{}, {}, SearchRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body = searchSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((e) => e.message).join(', ');
      next(ApiError.badRequest(message));
    } else {
      next(error);
    }
  }
};
