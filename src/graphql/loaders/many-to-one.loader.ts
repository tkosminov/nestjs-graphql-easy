import Dataloader from 'dataloader';
import { getRepository } from 'typeorm';

import { reduceToObject } from '../../helpers/array.helper';

export const manyToOneLoader = (select: string[], tableName: string) =>
  new Dataloader(async (keys: Array<string | number>) => {
    select.push(tableName + '.id');

    const polloptions = await getRepository(tableName)
      .createQueryBuilder(tableName)
      .select(select)
      .where('id IN (:...keys)', { keys })
      .getMany();

    const gs = reduceToObject(polloptions, 'id');

    return keys.map((k) => gs[k]);
  });
