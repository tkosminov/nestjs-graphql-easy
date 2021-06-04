import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { EntitiesModule } from './entities/entities.module';
import GraphQLModule from './graphql/graphql.module';

@Module({
  imports: [DatabaseModule, GraphQLModule, EntitiesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
