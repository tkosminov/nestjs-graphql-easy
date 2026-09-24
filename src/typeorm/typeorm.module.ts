import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule as NestJSTypeOrmModule } from '@nestjs/typeorm';

import { ConfigService } from '../config/config.service.js';
import { TypeOrmOptionsFactory } from './typeorm-options.factory.js';
import { TypeOrmOptionsModule } from './typeorm-options.module.js';

@Module({})
export class TypeOrmModule {
  public static forRoot(): DynamicModule {
    return {
      imports: [
        NestJSTypeOrmModule.forRootAsync({
          imports: [TypeOrmOptionsModule.forRoot()],
          inject: [TypeOrmOptionsFactory, ConfigService],
          useFactory: async (factory: TypeOrmOptionsFactory) => factory.createTypeOrmOptions(),
        }),
      ],
      module: TypeOrmModule,
    };
  }
}
