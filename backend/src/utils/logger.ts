const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(`[${new Date().toISOString()}] DEBUG:`, ...args);
    }
  },
  info: (...args: any[]) => {
    console.info(`[${new Date().toISOString()}] INFO:`, ...args);
  },
  error: (...args: any[]) => {
    console.error(`[${new Date().toISOString()}] ERROR:`, ...args);
  },
};