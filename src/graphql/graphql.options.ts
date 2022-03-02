import { Injectable } from '@nestjs/common';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { GraphQLError, GraphQLSchema } from 'graphql';

import config from 'config';
import { Request } from 'express';

import { corsOptionsDelegate } from '../cors.options';
import { LoggerStore } from '../logger/logger.store';

const appSettings = config.get<IAppSettings>('APP_SETTINGS');
const graphqlSettings = config.get<IGraphqlSettings>('GRAPHQL_SETTINGS');

@Injectable()
export class GraphqlOptions implements GqlOptionsFactory {
  public createGqlOptions(): Promise<ApolloDriverConfig> | ApolloDriverConfig {
    return {
      ...graphqlSettings,
      driver: ApolloDriver,
      autoSchemaFile: __dirname + '/schema.graphql',
      formatError: (err: GraphQLError) => {
        return err;
      },
      context: ({ req }: { req: Request & { logger_store: LoggerStore } }) => ({
        req,
        logger_store: req.logger_store,
      }),
      cors: corsOptionsDelegate,
      bodyParserConfig: {
        limit: appSettings.bodyLimit,
      },
      transformSchema: (schema: GraphQLSchema) => {
        return schema;
      },
    };
  }
}
