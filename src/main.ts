import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config/getEnvs';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Main-auth');
  const app = await NestFactory.create(AppModule);
  await app.listen(envs.port);
  logger.log('Auth microservice started on port ' + envs.port);
}
bootstrap();
