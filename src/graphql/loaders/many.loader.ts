import { getRepository, OrderByCondition } from 'typeorm';

import { IParsedFilter } from '../filters/parser.filter';

import { ILoaderData } from './decorator.loader';

export const manyLoader = (selected_fields: Set<string>, data: ILoaderData, filters: IParsedFilter | null, orders: OrderByCondition | null) => {
  const qb = getRepository(data.relation_table)
    .createQueryBuilder(data.relation_table)
    .select(Array.from(selected_fields).map((selected_field) => `${data.relation_table}.${selected_field}`));

  if (filters) {
    qb.where(filters.query, filters.params);
  }

  if (orders) {
    qb.orderBy(orders)
  }

  return qb.getMany();
};
