import { AsyncLocalStorage } from 'async_hooks';

export interface LoggerStore {
  requestId: string;
  traceId: string;
}

export const loggerStorage = new AsyncLocalStorage<LoggerStore>();
