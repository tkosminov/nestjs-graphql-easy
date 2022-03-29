import { Args, ReturnTypeFunc } from '@nestjs/graphql';

import { buildOrder } from './builder.order';

export const Order = (enity: ReturnTypeFunc) => {
  return Args({
    name: 'ORDER',
    nullable: true,
    type: buildOrder(enity),
  });
};
