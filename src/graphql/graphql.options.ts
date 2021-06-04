import { Injectable } from '@nestjs/common';
import { GqlModuleOptions, GqlOptionsFactory } from '@nestjs/graphql';

import { GraphQLError, GraphQLSchema } from 'graphql';

import config from 'config';
import { Request } from 'express';

import { corsOptionsDelegate } from '../cors.options';

const appSettings = config.get<IAppSettings>('APP_SETTINGS');
const graphqlSettings = config.get<IGraphqlSettings>('GRAPHQL_SETTINGS');

@Injectable()
export class GraphqlOptions implements GqlOptionsFactory {
  public createGqlOptions(): Promise<GqlModuleOptions> | GqlModuleOptions {
    return {
      ...graphqlSettings,
      autoSchemaFile: __dirname + '/schema.graphql',
      formatError: (err: GraphQLError) => {
        return err;
      },
      context: ({ req }: { req: Request }) => ({ req }),
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
