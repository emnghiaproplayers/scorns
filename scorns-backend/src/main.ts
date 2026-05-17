import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  await app.listen(port);
  console.log(`Application running on port ${port}`);
}
bootstrap();