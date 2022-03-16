import { getRepository, OrderByCondition } from 'typeorm';

import { IParsedFilter } from '../filter/parser.filter';
import { IParsedPagination } from '../pagination/parser.pagination';

import { ILoaderData } from './decorator.loader';

export const manyLoader = (
  selected_fields: Set<string>,
  data: ILoaderData,
  filters: IParsedFilter | null,
  orders: OrderByCondition | null,
  paginations: IParsedPagination | null
) => {
  const qb = getRepository(data.relation_table)
    .createQueryBuilder(data.relation_table)
    .select(Array.from(selected_fields).map((selected_field) => `${data.relation_table}.${selected_field}`))
    .where(`${data.relation_table}.id IS NOT NULL`);

  if (data.relation_where) {
    qb.andWhere(data.relation_where.query, data.relation_where.params);
  }

  if (filters) {
    qb.andWhere(filters.query, filters.params);
  }

  if (orders) {
    qb.orderBy(orders);
  }

  if (paginations) {
    qb.limit(paginations.limit);
    qb.offset(paginations.offset);
  }

  return qb.getMany();
};
