import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  
  const logger = new Logger('Bootstrap');
  logger.log('PostgreSQL Database connected successfully!');

  await app.listen(port);
  logger.log(`Application running on port ${port}`);
}
bootstrap();