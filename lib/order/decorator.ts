import { Args, ReturnTypeFunc } from '@nestjs/graphql';

import { buildOrder } from './builder.js';

export const Order = (entity: ReturnTypeFunc) => {
  return Args({
    name: 'ORDER',
    nullable: true,
    type: buildOrder(entity),
  });
};
