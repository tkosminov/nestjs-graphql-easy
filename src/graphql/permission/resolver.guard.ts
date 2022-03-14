import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { access_denied } from '@errors';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context) as GqlExecutionContext & { user: any };

    const user = ctx.user;

    if (!user) {
      // access_denied({ raise: true })
    }

    return true;
  }
}
