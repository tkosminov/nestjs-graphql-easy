import { Global, Module } from '@nestjs/common';
import { GraphQLModule as NestJSGraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { PubSub } from 'graphql-subscriptions';

import { GraphqlOptions } from './graphql.options';

export const GRAPHQL_SUBSCRIPTIONS_PUB_SUB = 'GRAPHQL_SUBSCRIPTIONS_PUB_SUB';

@Global()
@Module({
  imports: [
    NestJSGraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [],
      useClass: GraphqlOptions,
      inject: [],
      driver: ApolloDriver,
    }),
  ],
  providers: [
    {
      provide: GRAPHQL_SUBSCRIPTIONS_PUB_SUB,
      useFactory: () => new PubSub(),
    },
  ],
  exports: [GRAPHQL_SUBSCRIPTIONS_PUB_SUB],
})
export class GraphQLModule {}
