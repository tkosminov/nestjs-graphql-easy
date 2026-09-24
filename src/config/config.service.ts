import { Injectable } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';

import { loadAndReplaceEnvs, ConfigEnvSchema } from './utils/index.js';

@Injectable()
export class ConfigService {
  private readonly _values: ConfigEnvSchema;

  constructor(config_path: string) {
    loadAndReplaceEnvs(config_path);

    this._values = this.loadConfig();
  }

  public get<K extends keyof ConfigEnvSchema>(key: K) {
    return this._values[key];
  }

  private validate(value: unknown) {
    const data = plainToInstance(ConfigEnvSchema, value);

    const errors: ValidationError[] = validateSync(data, { skipMissingProperties: false });

    if (errors.length > 0) {
      const msg = errors.reduce<string[]>((acc, curr) => {
        if (curr.constraints) {
          acc.push(...Object.values(curr.constraints));
        }

        return acc;
      }, []);

      throw new Error(msg.join(', '));
    }

    return data;
  }

  private getAllSchemaKeys(): Set<string> {
    const schema = new ConfigEnvSchema();

    return new Set(Object.keys(schema));
  }

  private getReplacedObj(keys: Set<string>): Record<string, string | undefined> {
    const result_obj_by_keys: Record<string, string | undefined> = {};

    keys.forEach((key) => {
      result_obj_by_keys[key] = process.env[key];
    });

    return result_obj_by_keys;
  }

  private loadConfig() {
    const keys = this.getAllSchemaKeys();
    const obj = this.getReplacedObj(keys);

    return this.validate(obj);
  }
}
