import { DataSource, DataSourceOptions } from 'typeorm';

import { ConfigService } from '../config/config.service.js';
import { TypeOrmOptionsFactory } from './typeorm-options.factory.js';

const config = new ConfigService(`${process.cwd()}/config`);
const factory = new TypeOrmOptionsFactory(config);

const data_source = new DataSource({
  ...(factory.createTypeOrmOptions() as DataSourceOptions),
});

export { data_source };
