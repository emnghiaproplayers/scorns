import { loadEnv } from './config/env';
// fail fast BEFORE the server starts
const env = loadEnv();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PinoLogger } from './pino-logger.service';
import { requestId } from './request-id.middleware';

async function bootstrap() {
  const pinoLogger = new PinoLogger();
  const app = await NestFactory.create(AppModule, {
    logger: pinoLogger,
  });

  app.enableShutdownHooks(); // run onModuleDestroy on SIGTERM/SIGINT
  app.use(requestId);

  pinoLogger.log('PostgreSQL Database connected successfully!', 'Bootstrap');

  await app.listen(env.PORT);
  pinoLogger.log(`Application running on port ${env.PORT}`, 'Bootstrap');
}
bootstrap();