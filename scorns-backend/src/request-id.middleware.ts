import { Request, Response, NextFunction } from 'express';
import { randomUUID, randomBytes } from 'crypto';
import { logger } from './logger';
import { loggerStorage } from './logger-context';

export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = (req.headers['x-request-id'] as string) || randomUUID();
  res.setHeader('x-request-id', id);

  // W3C traceparent format: 00-traceId-parentId-traceFlags
  const traceparent = req.headers['traceparent'] as string;
  let traceId = '';
  if (traceparent) {
    const parts = traceparent.split('-');
    if (parts.length >= 4) {
      traceId = parts[1];
    }
  }

  // Fallback to generating a 32-character hexadecimal string if no valid traceparent exists
  if (!traceId || traceId.length !== 32) {
    traceId = randomBytes(16).toString('hex');
  }

  res.setHeader('x-trace-id', traceId);

  const contextLogger = logger.child({ requestId: id, traceId });
  (req as any).log = contextLogger;

  // Run downstream handlers inside AsyncLocalStorage context
  loggerStorage.run({ requestId: id, traceId }, () => {
    contextLogger.info({ method: req.method, url: req.url }, 'request received');
    next();
  });
}
