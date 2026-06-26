import pino from 'pino';
import { loadEnv } from './config/env';

const env = loadEnv();

export const logger = pino({
  level: env.LOG_LEVEL,
  // Per-env: pretty in dev, raw JSON in prod
  transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
  redact: ['req.headers.authorization', '*.password', '*.jwtSecret'],
});
