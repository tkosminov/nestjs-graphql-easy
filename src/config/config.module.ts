import { DynamicModule, FactoryProvider, Module } from '@nestjs/common';

import { ConfigService } from './config.service.js';

@Module({})
export class ConfigModule {
  public static forRoot(config_path: string): DynamicModule {
    const provider: FactoryProvider = {
      provide: ConfigService,
      useFactory: () => new ConfigService(config_path),
    };

    return {
      global: true,
      module: ConfigModule,
      providers: [provider],
      exports: [provider],
    };
  }
}
