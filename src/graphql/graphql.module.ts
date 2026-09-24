import { Module } from '@nestjs/common';
import { GraphQLModule as NestJSGraphQLModule } from '@nestjs/graphql';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { GraphQLOptions } from './graphql.options.js';

@Module({
  imports: [
    NestJSGraphQLModule.forRootAsync<ApolloDriverConfig>({
      useClass: GraphQLOptions,
      driver: ApolloDriver,
    }),
  ],
})
export class GraphQLModule {}
