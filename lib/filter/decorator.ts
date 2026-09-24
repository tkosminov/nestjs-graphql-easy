import { Args, ReturnTypeFunc } from '@nestjs/graphql';

import { buildFilter } from './builder.js';

export const Filter = (entity: ReturnTypeFunc) => {
  return Args({
    name: 'WHERE',
    nullable: true,
    type: buildFilter(entity),
  });
};
