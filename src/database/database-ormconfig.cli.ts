import { DataSource } from 'typeorm';

import { getOrmConfig } from './database-ormconfig.constant';

export default new DataSource({
  ...getOrmConfig(),
});
