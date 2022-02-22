import Dataloader from 'dataloader';
import { getRepository } from 'typeorm';

import { capitalize } from '../../helpers/string.helper';
import { reduceToObject } from '../../helpers/array.helper';
import { getTableFks } from '../store';

import { ILoaderData } from './decorator.loader';

export const manyToOneLoader = (selected_fields: Set<string>, data: ILoaderData) => {
  return new Dataloader(async (keys: Array<string | number>) => {
    selected_fields.add('id');
    selected_fields.add(data.relation_fk);

    getTableFks(capitalize(data.relation_table)).forEach((col) => {
      selected_fields.add(col);
    });

    const qb = getRepository(data.relation_table)
      .createQueryBuilder(data.relation_table)
      .select(Array.from(selected_fields).map((selected_field) => `${data.relation_table}.${selected_field}`))
      .where(`${data.relation_table}.${data.relation_fk} IN (:...keys)`, { keys });

    const poll_options = await qb.getMany();

    const gs = reduceToObject(poll_options, data.relation_fk);

    return keys.map((k) => gs[k]);
  });
};
