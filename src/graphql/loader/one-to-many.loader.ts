import Dataloader from 'dataloader';
import { getRepository, OrderByCondition } from 'typeorm';

import { capitalize } from '../../helpers/string.helper';
import { groupBy } from '../../helpers/array.helper';
import { IParsedFilter } from '../filter/parser.filter';
import { getTableFks } from '../store';

import { ILoaderData } from './decorator.loader';

export const oneToManyLoader = (
  selected_fields: Set<string>,
  data: ILoaderData,
  filters: IParsedFilter | null,
  orders: OrderByCondition | null
) => {
  return new Dataloader(async (keys: Array<string | number>) => {
    selected_fields.add('id');
    selected_fields.add(data.relation_fk);

    getTableFks(capitalize(data.relation_table)).forEach((col) => {
      selected_fields.add(col);
    });

    const qb = getRepository(data.relation_table)
      .createQueryBuilder(data.relation_table)
      .select(Array.from(selected_fields).map((selected_field) => `${data.relation_table}.${selected_field}`))
      .where(`${data.relation_table}.${data.relation_fk} IN (:...keys)`, {
        keys,
      });

    if (filters) {
      qb.andWhere(filters.query, filters.params);
    }

    if (orders) {
      qb.orderBy(orders);
    }

    const poll_options = await qb.getMany();

    const gs = groupBy(poll_options, data.relation_fk);

    return keys.map((k) => gs[k]);
  });
};
