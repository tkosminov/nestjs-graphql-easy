import { MiddlewareConsumer, Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { EntitiesModule } from './entities/entities.module';
import GraphQLModule from './graphql/graphql.module';
import { HealthzModule } from './healthz/healthz.module';
import { LoggerModule } from './logger/logger.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';

@Module({
  imports: [LoggerModule, HealthzModule, DatabaseModule, GraphQLModule, EntitiesModule],
  controllers: [],
  providers: [],
})
export class AppModule {
  public configure(consumer: MiddlewareConsumer): void | MiddlewareConsumer {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
