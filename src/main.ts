import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import bodyParser from 'body-parser';
import helmet from 'helmet';

import { AppModule } from './app.module.js';
import { ConfigService } from './config/config.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(bodyParser.json({ limit: config.get('APP_BODY_LIMIT') }));
  app.use(
    bodyParser.urlencoded({
      limit: config.get('APP_BODY_LIMIT'),
      extended: true,
      parameterLimit: config.get('APP_BODY_PARAMETER_LIMIT'),
    })
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );

  await app.listen(config.get('APP_PORT')).then(() => {
    console.log(`${config.get('APP_NAME')} listening on http://localhost:${config.get('APP_PORT')}`);
  });
}

await bootstrap();
