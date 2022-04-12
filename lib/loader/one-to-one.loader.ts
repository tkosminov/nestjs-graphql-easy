import Dataloader from 'dataloader';

import { EFilterOperator } from '../filter/builder.filter';
import { reduceToObject } from '../helper';

import { ILoaderData } from './decorator.loader';

export const oneToOneLoader = (selected_columns: Set<string>, entity_table_name: string, data: ILoaderData) => {
  return new Dataloader(async (keys: Array<string | number>) => {
    const qb = data.entity_manager
      .getRepository(entity_table_name)
      .createQueryBuilder(entity_table_name)
      .select(Array.from(selected_columns).map((selected_column) => `${entity_table_name}.${selected_column}`));

    if (data.entity_joins?.length) {
      for (const join of data.entity_joins) {
        qb.innerJoin(join.query, join.alias);
      }

      qb.distinct();
    }

    qb.where(`${entity_table_name}.${data.entity_fk_key} IN (:...keys)`, { keys });

    if (data.entity_wheres?.length) {
      for (const where of data.entity_wheres) {
        qb.andWhere(where.query, where.params);
      }
    }

    const poll_options = await qb.getMany();

    const gs = reduceToObject(poll_options, data.entity_fk_key);

    return keys.map((k) => gs[k]);
  });
};
