const {
  getTransactionListByUser,
  searchTransaction,
  getTime,
} = require('@yayawallet/node-sdk');

import { TransactionResponse, SearchRequest } from '../types';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

const YAYA_API_URL = process.env.YAYA_API_URL;
const YAYA_API_KEY = process.env.YAYA_API_KEY;
const YAYA_API_SECRET = process.env.YAYA_API_SECRET;
const YAYA_API_PATH = process.env.YAYA_API_PATH || '/api/en';
const YAYA_TEST_API_URL = process.env.YAYA_TEST_API_URL;

if (!YAYA_API_URL || !YAYA_API_KEY || !YAYA_API_SECRET || !YAYA_API_PATH || !YAYA_TEST_API_URL) {
  throw new Error('YaYa API configuration (URL, key, secret, path, or test URL) missing in environment variables');
}

const getServerTime = async (retries = 3, delay = 1000): Promise<number> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await getTime();
      logger.info(`getTime response (attempt ${attempt}): ${JSON.stringify(response)}`);
      if (typeof response.time !== 'number') {
        throw new ApiError(500, `Invalid server time format from YaYa API: ${JSON.stringify(response)}`);
      }
      return response.time;
    } catch (error: any) {
      logger.error(`Error fetching YaYa API server time from ${YAYA_TEST_API_URL}/time (attempt ${attempt}):`, {
        message: error.message,
        status: error.status,
        response: error.response?.text || 'No response text',
        stack: error.stack,
      });
      if (attempt === retries) {
        logger.error('Max retries reached for getServerTime, falling back to local timestamp');
        return Date.now();
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return Date.now();
};

export const getTransactions = async (page: number): Promise<TransactionResponse> => {
  try {
    logger.info(`Calling SDK getTransactionListByUser with page: ${page} at ${YAYA_TEST_API_URL}/transaction/find-by-user`);

    const result = await getTransactionListByUser({ p: page.toString() });

    if (!Array.isArray(result.data)) {
      throw new ApiError(500, `Invalid response format from YaYa API for getTransactions: ${JSON.stringify(result)}`);
    }

    return result as TransactionResponse;
  } catch (error: any) {
    logger.error(`Error fetching transactions from YaYa API at ${YAYA_TEST_API_URL}/transaction/find-by-user:`, {
      message: error.message,
      status: error.status,
      response: error.response?.text || 'No response text',
      stack: error.stack,
    });
    if (error.type === 'invalid-json') {
      logger.error(`Raw response causing invalid JSON error for getTransactions: ${error.message}`);
      throw new ApiError(500, `YaYa API returned invalid JSON response for getTransactions: ${error.message}`);
    }
    throw new ApiError(
      error.status || 500,
      error.message || 'Failed to fetch transactions from YaYa API'
    );
  }
};

export const searchTransactions = async (query: SearchRequest): Promise<TransactionResponse> => {
  const retries = 3;
  const delay = 2000;
  const timeout = 30000;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const queryValue = query.id || query.senderAccount || query.receiverAccount || query.cause || '';
      if (!queryValue) {
        throw new ApiError(400, 'Search query is empty. At least one search field must be provided.');
      }

      logger.info(`Calling SDK searchTransaction (attempt ${attempt}) with query value: '${queryValue}' at ${YAYA_TEST_API_URL}/transaction/search`);

      let result;
      try {
        result = await Promise.race([
          searchTransaction(queryValue),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), timeout)),
        ]);
      } catch (sdkError: any) {
        logger.error(`SDK searchTransaction failed on attempt ${attempt}: ${sdkError.message}`, { stack: sdkError.stack });
        throw sdkError;
      }

      if (!Array.isArray(result.data)) {
        throw new ApiError(500, `Invalid response format from YaYa API for searchTransactions: ${JSON.stringify(result)}`);
      }

      return result as TransactionResponse;
    } catch (error: any) {
      logger.error(`Error searching transactions in YaYa API at ${YAYA_TEST_API_URL}/transaction/search (attempt ${attempt}):`, {
        message: error.message,
        status: error.status,
        response: error.response?.text?.substring(0, 500) || 'No response text',
        headers: error.response?.headers || 'No headers',
        stack: error.stack,
      });

      if (error.message && error.message.includes('401 (Unauthorized)')) {
        logger.error('Authentication failed. Please check YAYA_API_KEY and YAYA_API_SECRET in your .env file.');
      } else if (error.type === 'invalid-json') {
        logger.error(`Raw response causing invalid JSON error for searchTransactions: ${error.message}, full response: ${error.response?.text?.substring(0, 500) || 'No response text'}`);
        throw new ApiError(500, `YaYa API returned invalid JSON response for searchTransactions: ${error.message}, response: ${error.response?.text?.substring(0, 500) || 'No response text'}`);
      }

      if (attempt === retries) {
        logger.error(`Max retries reached for searchTransaction`);
        throw new ApiError(
          error.status || 500,
          error.message || 'Failed to search transactions in YaYa API after multiple attempts'
        );
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new ApiError(500, 'Failed to search transactions after exhausting all retries.');
};
