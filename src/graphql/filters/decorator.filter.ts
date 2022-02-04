import { Args } from '@nestjs/graphql';

import { buildFilter } from './builder.filter';

export interface IFilterData {
  relation_table: string;
}

export const Filter = (data: IFilterData) => {
  return Args({
    name: 'WHERE',
    nullable: true,
    type: buildFilter(data),
  });
};
