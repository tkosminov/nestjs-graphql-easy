import Dataloader from 'dataloader';
import { EntityManager } from 'typeorm';

import { IParsedOrder } from '../../order/parser.js';
import { groupBy } from '../../helper/index.js';
import { IParsedFilter } from '../../filter/parser.js';
import { ILoaderData } from '../decorator.js';

export const oneToManyLoader = (
  entity_manager: EntityManager,
  selected_columns: Set<string>,
  entity_table_name: string,
  data: ILoaderData,
  filters: IParsedFilter | null,
  orders: IParsedOrder[] | null
) => {
  return new Dataloader(async (keys: Array<string | number>) => {
    const qb = entity_manager
      .getRepository(entity_table_name)
      .createQueryBuilder(entity_table_name)
      .select(Array.from(selected_columns).map((selected_column) => `${entity_table_name}.${selected_column}`));

    if (data.entity_joins?.length) {
      for (const join of data.entity_joins) {
        qb.innerJoin(join.query, join.alias);
      }

      qb.distinct();
    }

    qb.where(`${entity_table_name}.${data.entity_fk_key} IN (:...keys)`, {
      keys,
    });

    if (data.entity_wheres?.length) {
      for (const where of data.entity_wheres) {
        qb.andWhere(where.query, where.params);
      }
    }

    if (filters) {
      qb.andWhere(filters.query, filters.params);
    }

    if (orders?.length) {
      orders.forEach((order, index) => {
        if (index === 0) {
          qb.orderBy(order.sort, order.order, order.nulls);
        } else {
          qb.addOrderBy(order.sort, order.order, order.nulls);
        }
      });
    }

    const poll_options = await qb.getMany();

    const gs = groupBy(poll_options, data.entity_fk_key);

    return keys.map((k) => gs[k]);
  });
};
