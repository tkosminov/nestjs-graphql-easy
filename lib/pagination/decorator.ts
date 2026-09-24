import { Args } from '@nestjs/graphql';
import { PaginationInputType } from './input-type.js';

export const Pagination = () => {
  return Args({
    name: 'PAGINATION',
    nullable: true,
    type: () => PaginationInputType,
  });
};
