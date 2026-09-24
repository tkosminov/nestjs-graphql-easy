import { DynamicModule, FactoryProvider, Module } from '@nestjs/common';

import { ConfigService } from '../config/config.service.js';
import { TypeOrmOptionsFactory } from './typeorm-options.factory.js';

@Module({})
export class TypeOrmOptionsModule {
  public static forRoot(): DynamicModule {
    const options_provider: FactoryProvider = {
      provide: TypeOrmOptionsFactory,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => new TypeOrmOptionsFactory(config),
    };

    return {
      module: TypeOrmOptionsModule,
      providers: [options_provider],
      exports: [options_provider],
    };
  }
}
