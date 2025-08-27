import { Request, Response, NextFunction } from 'express';
import { getTransactions, searchTransactions } from '../services/yayaService';
import { SearchRequest } from '../types';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';

export const getTransactionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.p as string) || 1;
    if (page < 1) {
      throw new ApiError(400, 'Page number must be a positive integer');
    }
    const result = await getTransactions(page);
    res.json(result);
  } catch (error) {
    logger.error('Error in getTransactionsController:', error);
    next(error);
  }
};

export const searchTransactionsController = async (
  req: Request<object, object, SearchRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.body;
    const result = await searchTransactions(query);
    res.json(result);
  } catch (error) {
    logger.error('Error in searchTransactionsController:', error);
    next(error);
  }
};

