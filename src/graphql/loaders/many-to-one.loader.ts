import Dataloader from 'dataloader';
import { getRepository } from 'typeorm';

import { reduceToObject } from '../../helpers/array.helper';
import { ILoaderData } from './decorator.loader';

export const manyToOneLoader = (selected_fields: Set<string>, data: ILoaderData) => {
  return new Dataloader(async (keys: Array<string | number>) => {
    selected_fields.add('id')

    const poll_options = await getRepository(data.relation_table)
      .createQueryBuilder(data.relation_table)
      .select(Array.from(selected_fields).map(selected_field => `${data.relation_table}.${selected_field}`))
      .where(`${data.relation_table}.id IN (:...keys)`, { keys })
      .getMany();

    const gs = reduceToObject(poll_options, 'id');

    return keys.map((k) => gs[k]);
  });
}
