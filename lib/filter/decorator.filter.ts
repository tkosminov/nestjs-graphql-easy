import { Args, ReturnTypeFunc } from '@nestjs/graphql';

import { buildFilter } from './builder.filter';

export const Filter = (enity: ReturnTypeFunc) => {
  return Args({
    name: 'WHERE',
    nullable: true,
    type: buildFilter(enity),
  });
};
