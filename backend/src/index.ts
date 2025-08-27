import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { getTransactionsController, searchTransactionsController } from './controllers/transactionController';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { validatePagination, validateSearchQuery } from './middleware/validate';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

app.use(cors({ origin: process.env.VITE_CLIENT_URL || 'http://localhost:5174' }));

app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

app.use(express.json());

app.get('/api/transactions', validatePagination, getTransactionsController);
app.post('/api/transactions/search', validateSearchQuery, searchTransactionsController);

app.use(notFoundHandler);

app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
