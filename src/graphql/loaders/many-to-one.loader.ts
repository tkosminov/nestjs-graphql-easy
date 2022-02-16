import Dataloader from 'dataloader';
import { getRepository, OrderByCondition } from 'typeorm';

import { reduceToObject } from '../../helpers/array.helper';
import { IParsedFilter } from '../filters/parser.filter';

import { ILoaderData } from './decorator.loader';

export const manyToOneLoader = (
  selected_fields: Set<string>,
  data: ILoaderData,
  filters: IParsedFilter | null,
  orders: OrderByCondition | null
) => {
  return new Dataloader(async (keys: Array<string | number>) => {
    selected_fields.add('id');

    const qb = getRepository(data.relation_table)
      .createQueryBuilder(data.relation_table)
      .select(Array.from(selected_fields).map((selected_field) => `${data.relation_table}.${selected_field}`))
      .where(`${data.relation_table}.id IN (:...keys)`, { keys });

    if (filters) {
      qb.andWhere(filters.query, filters.params);
    }

    if (orders) {
      qb.orderBy(orders);
    }

    const poll_options = await qb.getMany();

    const gs = reduceToObject(poll_options, 'id');

    return keys.map((k) => gs[k]);
  });
};
