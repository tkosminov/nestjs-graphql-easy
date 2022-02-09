/* eslint-disable @typescript-eslint/no-empty-function */

import { ID, InputType, ReturnTypeFunc, Int, Float, GqlTypeReference } from '@nestjs/graphql';
import { ColumnMetadataArgs } from 'typeorm/metadata-args/ColumnMetadataArgs';

import { capitalize } from '../../helpers/string.helper';
import { decorateField, where_field_input_types, fk_columns, parseColumns, table_columns, where_input_types } from '../store/store';

import { IFilterData } from './decorator.filter';

export enum EFilterOperator {
  AND = 'AND',
  OR = 'OR',
}

export enum EFilterOperation {
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

const basic_operations = ['EQ', 'NOT_EQ', 'NULL', 'IN', 'NOT_IN'];
const string_operations = ['ILIKE', 'NOT_ILIKE'];
const precision_operations = ['GT', 'GTE', 'LT', 'LTE'];

const string_types: GqlTypeReference[] = [String];
const precision_types: GqlTypeReference[] = [Int, Float, Number, Date];

const buildFilterField = (column: ColumnMetadataArgs): ReturnTypeFunc => {
  let col_type: GqlTypeReference = String;

  if (fk_columns.get(column.target['name'])?.has(column)) {
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

  const name = `${col_type['name']}_FilterInputType`;

  if (where_field_input_types.has(name)) {
    return where_field_input_types.get(name);
  }

  const field_input_type = function fieldInputType() {};

  basic_operations.forEach((operation) => {
    switch (EFilterOperation[operation]) {
      case EFilterOperation.NULL:
      case EFilterOperation.NOT_NULL:
        decorateField(field_input_type, operation, () => Boolean, {
          nullable: true,
        });
        break;
      case EFilterOperation.IN:
      case EFilterOperation.NOT_IN:
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
    value: name,
  });

  InputType()(field_input_type);

  where_field_input_types.set(name, () => field_input_type);

  return () => field_input_type;
};

export const buildFilter = (data: IFilterData): ReturnTypeFunc => {
  parseColumns()

  const table_name = capitalize(data.relation_table);

  if (where_input_types.has(table_name)) {
    return where_input_types.get(table_name);
  }

  const where_input_type = function whereInputType() {};

  table_columns.get(table_name).forEach((col) => {
    decorateField(where_input_type, col.propertyName, buildFilterField(col));
  })

  Object.values(EFilterOperator).forEach((operator) => {
    decorateField(where_input_type, operator, () => [where_input_type]);
  });

  Object.defineProperty(where_input_type, 'name', {
    value: `${table_name}FilterInputType`,
  });

  InputType()(where_input_type);

  where_input_types.set(table_name, () => where_input_type);

  return () => where_input_type;
};
