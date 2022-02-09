import Dataloader from 'dataloader';
import { getRepository } from 'typeorm';

import { groupBy } from '../../helpers/array.helper';
import { IParsedFilter } from '../filters/parser.filter';

import { ILoaderData } from './decorator.loader';

export const oneToManyLoader = (selected_fields: Set<string>, data: ILoaderData, filters: IParsedFilter = null) => {
  return new Dataloader(async (keys: Array<string | number>) => {
    selected_fields.add('id');
    selected_fields.add(data.relation_fk);

    const qb = getRepository(data.relation_table)
      .createQueryBuilder(data.relation_table)
      .select(Array.from(selected_fields).map((selected_field) => `${data.relation_table}.${selected_field}`))
      .where(`${data.relation_table}.${data.relation_fk} IN (:...keys)`, {
        keys,
      });

    if (filters) {
      qb.andWhere(filters.query, filters.params);
    }

    const poll_options = await qb.getMany();

    const gs = groupBy(poll_options, data.relation_fk);

    return keys.map((k) => gs[k]);
  });
};
