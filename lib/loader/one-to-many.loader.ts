import Dataloader from 'dataloader';
import { EntityManager, getConnection, OrderByCondition } from 'typeorm';

import { groupBy } from '../helper';
import { IParsedFilter } from '../filter/parser.filter';

import { ILoaderData } from './decorator.loader';

export const oneToManyLoader = (
  selected_columns: Set<string>,
  entity_table_name: string,
  data: ILoaderData,
  filters: IParsedFilter | null,
  orders: OrderByCondition | null
) => {
  return new Dataloader(async (keys: Array<string | number>) => {
    let manager: EntityManager;

    if (data.entity_manager) {
      manager = data.entity_manager;
    } else {
      manager = getConnection().createEntityManager();
    }

    const qb = manager
      .getRepository(entity_table_name)
      .createQueryBuilder(entity_table_name)
      .select(Array.from(selected_columns).map((selected_column) => `${entity_table_name}.${selected_column}`))
      .where(`${entity_table_name}.${data.entity_fk_key} IN (:...keys)`, {
        keys,
      });

    if (data.entity_where) {
      qb.andWhere(data.entity_where.query, data.entity_where.params);
    }

    if (filters) {
      qb.andWhere(filters.query, filters.params);
    }

    if (orders) {
      qb.orderBy(orders);
    }

    const poll_options = await qb.getMany();

    const gs = groupBy(poll_options, data.entity_fk_key);

    return keys.map((k) => gs[k]);
  });
};
