import { LoggerService, Injectable } from '@nestjs/common';
import { logger } from './logger';
import { loggerStorage } from './logger-context';

@Injectable()
export class PinoLogger implements LoggerService {
  private getContextMetadata() {
    const store = loggerStorage.getStore();
    return store ? { requestId: store.requestId, traceId: store.traceId } : {};
  }

  log(message: any, context?: string) {
    const metadata = { context, ...this.getContextMetadata() };
    if (typeof message === 'object') {
      logger.info({ ...metadata, ...message });
    } else {
      logger.info(metadata, message);
    }
  }

  error(message: any, trace?: string, context?: string) {
    const metadata = { context, trace, ...this.getContextMetadata() };
    if (typeof message === 'object') {
      logger.error({ ...metadata, ...message });
    } else {
      logger.error(metadata, message);
    }
  }

  warn(message: any, context?: string) {
    const metadata = { context, ...this.getContextMetadata() };
    if (typeof message === 'object') {
      logger.warn({ ...metadata, ...message });
    } else {
      logger.warn(metadata, message);
    }
  }

  debug(message: any, context?: string) {
    const metadata = { context, ...this.getContextMetadata() };
    if (typeof message === 'object') {
      logger.debug({ ...metadata, ...message });
    } else {
      logger.debug(metadata, message);
    }
  }

  verbose(message: any, context?: string) {
    const metadata = { context, ...this.getContextMetadata() };
    if (typeof message === 'object') {
      logger.trace({ ...metadata, ...message });
    } else {
      logger.trace(metadata, message);
    }
  }
}
