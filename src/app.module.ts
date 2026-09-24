import { Module } from '@nestjs/common';

import { ConfigModule } from './config/config.module.js';
import { TypeOrmModule } from './typeorm/typeorm.module.js';
import { GraphQLModule } from './graphql/graphql.module.js';
import { GraphQLPubSubModule } from './graphql/graphql.pubsub.js';
import { ModelsModule } from './models/models.module.js';

@Module({
  imports: [ConfigModule.forRoot(`${process.cwd()}/config`), TypeOrmModule.forRoot(), GraphQLModule, GraphQLPubSubModule, ModelsModule],
})
export class AppModule {}
