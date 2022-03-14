import { NextFn, FieldMiddleware, MiddlewareContext, GraphQLExecutionContext } from '@nestjs/graphql';

import { GraphQLResolveInfo } from 'graphql';
import { access_denied } from '@errors';

export const checkRoleMiddleware: FieldMiddleware = async <T>(
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const { args, info, context, source }: { args: Record<string, unknown>; info: GraphQLResolveInfo; context: GraphQLExecutionContext & { user: any }; source: Partial<T> } = ctx;

  const { extensions } = info.parentType.getFields()[info.fieldName];

  const user = context.user;

  if (!user || !user.role !== extensions.role) {
    // access_denied({ raise: true })
  }

  return await next();
};
