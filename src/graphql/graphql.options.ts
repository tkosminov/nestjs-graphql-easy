import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { GqlOptionsFactory } from '@nestjs/graphql';

import { setDataSource } from 'nestjs-graphql-easy';

import { DataSource } from 'typeorm';

@Injectable()
export class GraphQLOptions implements GqlOptionsFactory {
  constructor(private readonly data_source: DataSource) {
    setDataSource(this.data_source);
  }

  public createGqlOptions(): Promise<ApolloDriverConfig> | ApolloDriverConfig {
    return {
      autoSchemaFile: true,
      graphiql: true,
      driver: ApolloDriver,
      context: ({ req }: { req: Request }) => ({
        req,
      }),
      subscriptions: {
        'graphql-ws': true,
      },
    };
  }
}
