/* eslint-disable @typescript-eslint/no-empty-function */

import { ID, InputType, Field, FieldOptions, ReturnTypeFunc, Int, Float, GqlTypeReference } from '@nestjs/graphql';

import { getMetadataArgsStorage } from 'typeorm';
import { ColumnMetadataArgs } from 'typeorm/metadata-args/ColumnMetadataArgs';

import { capitalize } from '../../helpers/string.helper';

import { IFilterData } from './decorator.filter';

export enum EOperatorQuery {
  AND = 'AND',
  OR = 'OR',
}

export enum EOperationQuery {
  EQ = '=',
  NOT_EQ = '!=',
  NULL = 'IS NULL',
  NOT_NULL = 'IS NOT NULL',
  IN = 'IN',
  NOT_IN = 'NOT IN',
  ILIKE = 'ILIKE',
  NOT_ILIKE = 'NOT_ILIKE',
  GT = '>',
  GTE = '>=',
  LT = '<',
  LTE = '<=',
}

const basic_operations = ['EQ', 'NOT_EQ', 'NULL', 'NOT_NULL', 'IN', 'NOT_IN'];
const string_operations = ['ILIKE', 'NOT_ILIKE'];
const precision_operations = ['GT', 'GTE', 'LT', 'LTE'];

const string_types: GqlTypeReference[] = [String];
const precision_types: GqlTypeReference[] = [Int, Float, Number, Date];

const where_input_types: Map<string, ReturnTypeFunc> = new Map();
const field_input_types: Map<string, ReturnTypeFunc> = new Map();
const fk_columns: Map<string, Set<string>> = new Map();

const decorateField = (fn: () => void, field_name: string, field_type: ReturnTypeFunc, field_options?: FieldOptions) => {
  fn.prototype[field_name] = Field(field_type, {
    ...field_options,
    nullable: true,
  })(fn.prototype, field_name);
};

const buildField = (column: ColumnMetadataArgs): ReturnTypeFunc => {
  const name = `${column.propertyName}_${column.target['name']}`;

  if (field_input_types.has(name)) {
    return field_input_types.get(name);
  }

  let col_type: GqlTypeReference = String;

  if (fk_columns.get(column.target['name'])?.has(column.propertyName)) {
    col_type = ID;
  } else if (column.options?.type) {
    if (column.options.primary) {
      col_type = ID;
    } else if (typeof column.options.type === 'function' && ['String', 'Number', 'Boolean', 'Date'].includes(column.options.type['name'])) {
      col_type = column.options.type;
    } else if (typeof column.options.type === 'string') {
      switch (column.options.type) {
        case 'uuid':
          col_type = ID;
          break;
        case 'int':
        case 'integer':
          col_type = Int;
          break;
        case 'float':
        case 'double precision':
          col_type = Float;
          break;
        case 'timestamp with time zone':
        case 'timestamp without time zone':
          col_type = Date;
          break;
        case 'bool':
        case 'boolean':
          col_type = Boolean;
          break;
      }
    }
  }

  const field_input_type = function fieldInputType() {};

  basic_operations.forEach((operation) => {
    switch (EOperationQuery[operation]) {
      case EOperationQuery.NULL:
      case EOperationQuery.NOT_NULL:
        decorateField(field_input_type, operation, () => Boolean, {
          nullable: true,
        });
        break;
      case EOperationQuery.IN:
      case EOperationQuery.NOT_IN:
        decorateField(field_input_type, operation, () => [col_type], {
          nullable: true,
        });
        break;
      default:
        decorateField(field_input_type, operation, () => col_type, {
          nullable: true,
        });
        break;
    }
  });

  if (string_types.includes(col_type)) {
    string_operations.forEach((operation) => {
      decorateField(field_input_type, operation, () => col_type, {
        nullable: true,
      });
    });
  }

  if (precision_types.includes(col_type)) {
    precision_operations.forEach((operation) => {
      decorateField(field_input_type, operation, () => col_type, {
        nullable: true,
      });
    });
  }

  Object.defineProperty(field_input_type, 'name', {
    value: `${name}FilterInputType`,
  });

  InputType()(field_input_type);

  field_input_types.set(name, () => field_input_type);

  return () => field_input_type;
};

export const buildFilter = (data: IFilterData): ReturnTypeFunc => {
  const table_name = capitalize(data.relation_table);

  if (where_input_types.has(table_name)) {
    return where_input_types.get(table_name);
  }

  const where_input_type = function whereInputType() {};

  const typeorm_metadata = getMetadataArgsStorage();

  if (!fk_columns.size) {
    typeorm_metadata.joinColumns.forEach((col) => {
      const table = col.target['name'];

      if (!fk_columns.has(table)) {
        fk_columns.set(table, new Set([col.name]));
      } else {
        fk_columns.get(table).add(col.name);
      }
    });
  }

  typeorm_metadata.columns
    .filter((col) => {
      return [table_name, 'EntityHelper'].includes(col.target['name']);
    })
    .forEach((col) => {
      if (!(col.options?.type && typeof col.options.type === 'string' && ['json', 'jsonb'].includes(col.options.type))) {
        decorateField(where_input_type, col.propertyName, buildField(col));
      }
    });

  Object.values(EOperatorQuery).forEach((operator) => {
    decorateField(where_input_type, operator, () => [where_input_type]);
  });

  Object.defineProperty(where_input_type, 'name', {
    value: `${table_name}FilterInputType`,
  });

  InputType()(where_input_type);

  where_input_types.set(table_name, () => where_input_type);

  return () => where_input_type;
};
