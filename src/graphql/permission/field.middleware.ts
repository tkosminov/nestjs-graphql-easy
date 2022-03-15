import { NextFn, FieldMiddleware, MiddlewareContext, GraphQLExecutionContext } from '@nestjs/graphql';

import { GraphQLResolveInfo } from 'graphql';
import { Request } from 'express';

import { access_denied } from '@errors';
import { LoggerStore } from '@logger/logger.store';

/**
 * set in file src/graphql/graphql.options.ts
 */
interface IContext {
  req: Request;
  logger_store: LoggerStore;
  user: any;
}

export const checkRoleMiddleware: FieldMiddleware = async (ctx: MiddlewareContext, next: NextFn) => {
  const {
    args,
    info,
    context,
    source,
  }: {
    args: Record<string, unknown>;
    info: GraphQLResolveInfo;
    context: IContext;
    source: Record<string, unknown>;
  } = ctx;

  const { extensions } = info.parentType.getFields()[info.fieldName];

  const user = context.user;

  if (!user || !user.role !== extensions.role) {
    // access_denied({ raise: true })
  }

  return await next();
};
