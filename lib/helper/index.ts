import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';

import { bad_request } from '../error';

export function capitalize(str: string) {
  const capitalized_chars = str.replace(/[-_\s.]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''));
  const capital_char = capitalized_chars[0].toUpperCase();

  return capital_char + capitalized_chars.slice(1);
}

export function underscore(str: string) {
  return str
    .replace(/(?:^|\.?)([A-Z])/g, function (x, y) {
      return '_' + y.toLowerCase();
    })
    .replace(/^_/, '');
}

export function pluck<T, K>(array: T[], key: string): K[] {
  return array.map((a) => a[key]);
}

export function shuffle<T>(array: T[]): T[] {
  return array.sort(() => Math.random() - 0.5);
}

export function uniq<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

export function reduceToObject<T>(array: T[], key: string): { [K: string]: T } {
  return array.reduce((acc, curr) => {
    acc[curr[key]] = curr;

    return acc;
  }, {});
}

export function groupBy<T>(array: T[], key: string): { [key: string]: T[] } {
  return array.reduce(
    (acc, curr) => {
      if (!acc.hasOwnProperty(curr[key])) {
        acc[curr[key]] = [];
      }

      acc[curr[key]].push(curr);

      return acc;
    },
    {} as { [key: string]: T[] }
  );
}

export function validateDTO(type: ClassConstructor<unknown>, value: unknown) {
  const errors: ValidationError[] = validateSync(plainToInstance(type, value) as object, { skipMissingProperties: true });

  if (errors.length > 0) {
    const msg = errors.map((error) => Object.values(error.constraints)).join(', ');

    bad_request({ raise: true, msg });
  }
}
