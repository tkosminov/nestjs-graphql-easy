import { Args } from '@nestjs/graphql';

import { buildOrder } from './builder.order';

export interface IOrderData {
  relation_table: string;
}

export const Order = (data: IOrderData) => {
  return Args({
    name: 'ORDER',
    nullable: true,
    type: buildOrder(data),
  });
};
