import { getRepository, OrderByCondition } from 'typeorm';

import { IParsedFilter } from '../filter/parser.filter';
import { IParsedPagination } from '../pagination/parser.pagination';

import { ILoaderData } from './decorator.loader';

export const manyLoader = (
  selected_columns: Set<string>,
  entity_table_name: string,
  data: ILoaderData,
  filters: IParsedFilter | null,
  orders: OrderByCondition | null,
  paginations: IParsedPagination | null
) => {
  const qb = getRepository(entity_table_name)
    .createQueryBuilder(entity_table_name)
    .select(Array.from(selected_columns).map((selected_column) => `${entity_table_name}.${selected_column}`))
    .where(`${entity_table_name}.${data.entity_fk_key} IS NOT NULL`);

  if (data.entity_where) {
    qb.andWhere(data.entity_where.query, data.entity_where.params);
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
