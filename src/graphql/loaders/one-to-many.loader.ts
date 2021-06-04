import Dataloader from 'dataloader';
import { getRepository } from 'typeorm';
import { singular } from 'pluralize';

import { groupBy } from '../../helpers/array.helper';

export const oneToManyLoader = (
  select: string[],
  tableName: string,
  foreignKey: string,
) =>
  new Dataloader(async (keys: Array<string | number>) => {
    tableName = singular(tableName);
    select.push(tableName + '.id');
    select.push(tableName + '.' + foreignKey);

    const polloptions = await getRepository(tableName)
      .createQueryBuilder(tableName)
      .select(select)
      .where(foreignKey + ' IN (:...keys)', { keys })
      .getMany();

    const gs = groupBy(polloptions, foreignKey);

    return keys.map((k) => gs[k] || []);
  });
