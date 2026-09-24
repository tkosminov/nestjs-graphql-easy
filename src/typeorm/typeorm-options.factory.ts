import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory as NestJSTypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { ConfigService } from '../config/config.service.js';
import { entities } from './typeorm-entity.list.js';
import { migrations } from './typeorm-migration.list.js';

@Injectable()
export class TypeOrmOptionsFactory implements NestJSTypeOrmOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  public createTypeOrmOptions(schema?: string): TypeOrmModuleOptions {
    const options: TypeOrmModuleOptions = {
      type: 'postgres',
      host: this.config.get('DB_HOST'),
      port: this.config.get('DB_PORT'),
      username: this.config.get('DB_USERNAME'),
      password: this.config.get('DB_PASSWORD'),
      database: this.config.get('DB_DATABASE'),
      entities,
      migrations,
      migrationsRun: true,
      synchronize: false,
      logging: this.config.get('DB_LOGGING'),
      schema,
    };

    return options;
  }
}
