import { ClassConstructor, plainToClass } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';

import { bad_request } from '@errors';

export function validateDTO(type: ClassConstructor<unknown>, value: unknown) {
  const errors: ValidationError[] = validateSync(plainToClass(type, value) as object, { skipMissingProperties: true });

  if (errors.length > 0) {
    const msg = errors.map((error) => Object.values(error.constraints)).join(', ');

    bad_request({ raise: true, msg });
  }
}
