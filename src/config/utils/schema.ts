import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsString, Matches, Min } from 'class-validator';

import { toArray, toNumber } from './transform.js';

export class ConfigEnvSchema {
  @IsIn(['development'])
  public NODE_ENV: 'development';

  @Matches(/^[a-z0-9_]+$/)
  public APP_NAME: string;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  public APP_PORT: number;

  @IsString()
  public APP_BODY_LIMIT: string;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  public APP_BODY_PARAMETER_LIMIT: number;

  @Matches(/^[a-z0-9_]+$/)
  public DB_DATABASE: string;

  @IsString()
  public DB_HOST: string;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  public DB_PORT: number;

  @IsString()
  public DB_USERNAME: string;

  @IsString()
  public DB_PASSWORD: string;

  @IsIn(['query', 'schema', 'error', 'warn', 'info', 'log', 'migration'], { each: true })
  @Transform(({ value }) => toArray(value))
  public DB_LOGGING: ('query' | 'schema' | 'error' | 'warn' | 'info' | 'log' | 'migration')[];
}
