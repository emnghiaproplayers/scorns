import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logger } from './logger';

export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = (req.headers['x-request-id'] as string) || randomUUID();
  res.setHeader('x-request-id', id);
  (req as any).log = logger.child({ requestId: id });
  (req as any).log.info({ method: req.method, url: req.url }, 'request received');
  next();
}
