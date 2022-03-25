import { Type } from '@nestjs/common';
import { Args } from '@nestjs/graphql';

import { buildOrder } from './builder.order';

export const Order = (enity: Type<any>) => {
  return Args({
    name: 'ORDER',
    nullable: true,
    type: buildOrder(enity),
  });
};
