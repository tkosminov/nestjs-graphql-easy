import Dataloader from 'dataloader';
import { getRepository } from 'typeorm';

import { reduceToObject } from '../helper';

import { ILoaderData } from './decorator.loader';

export const oneToOneLoader = (selected_columns: Set<string>, entity_table_name: string, data: ILoaderData) => {
  return new Dataloader(async (keys: Array<string | number>) => {
    const qb = getRepository(entity_table_name)
      .createQueryBuilder(entity_table_name)
      .select(Array.from(selected_columns).map((selected_column) => `${entity_table_name}.${selected_column}`))
      .where(`${entity_table_name}.${data.entity_fk_key} IN (:...keys)`, { keys });

    const poll_options = await qb.getMany();

    const gs = reduceToObject(poll_options, data.entity_fk_key);

    return keys.map((k) => gs[k]);
  });
};
