import { LoggerService, Injectable } from '@nestjs/common';
import { logger } from './logger';

@Injectable()
export class PinoLogger implements LoggerService {
  log(message: any, context?: string) {
    if (typeof message === 'object') {
      logger.info({ context, ...message });
    } else {
      logger.info({ context }, message);
    }
  }

  error(message: any, trace?: string, context?: string) {
    if (typeof message === 'object') {
      logger.error({ context, trace, ...message });
    } else {
      logger.error({ context, trace }, message);
    }
  }

  warn(message: any, context?: string) {
    if (typeof message === 'object') {
      logger.warn({ context, ...message });
    } else {
      logger.warn({ context }, message);
    }
  }

  debug(message: any, context?: string) {
    if (typeof message === 'object') {
      logger.debug({ context, ...message });
    } else {
      logger.debug({ context }, message);
    }
  }

  verbose(message: any, context?: string) {
    if (typeof message === 'object') {
      logger.trace({ context, ...message });
    } else {
      logger.trace({ context }, message);
    }
  }
}
