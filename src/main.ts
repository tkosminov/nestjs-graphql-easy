import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

import config from 'config';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { json, urlencoded } from 'body-parser';
import { DataSourceOptions } from 'typeorm';
import { createDatabase } from 'typeorm-extension';

import { AppModule } from './app.module';
import { corsOptionsDelegate } from './cors.options';
import { getOrmConfig } from './database/database-ormconfig.constant';

const appSettings = config.get<IAppSettings>('APP_SETTINGS');

async function bootstrap() {
  const server = express();

  await createDatabase({
    ifNotExist: true,
    options: getOrmConfig() as DataSourceOptions,
  });

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    bodyParser: true,
  });

  app.use(json({ limit: appSettings.bodyLimit }));

  app.use(
    urlencoded({
      extended: true,
      limit: appSettings.bodyLimit,
      parameterLimit: appSettings.bodyParameterLimit,
    })
  );

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(cookieParser());

  app.enableCors(corsOptionsDelegate);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );

  await app.listen(appSettings.port);
}

bootstrap();
