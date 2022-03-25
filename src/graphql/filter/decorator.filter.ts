import { Type } from '@nestjs/common';
import { Args } from '@nestjs/graphql';

import { buildFilter } from './builder.filter';

export const Filter = (enity: Type<any>) => {
  return Args({
    name: 'WHERE',
    nullable: true,
    type: buildFilter(enity),
  });
};
