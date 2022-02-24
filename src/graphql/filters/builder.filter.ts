/* eslint-disable @typescript-eslint/no-empty-function */

import { InputType, ReturnTypeFunc, Int, Float, GqlTypeReference } from '@nestjs/graphql';

import { decorateField, where_field_input_types, where_input_types, gql_fields, IField } from '../store';

import { capitalize } from '../../helpers/string.helper';

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
  NOT_ILIKE = 'NOT ILIKE',
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

const buildFilterField = (column: IField): ReturnTypeFunc => {
  const col_type: GqlTypeReference = column.field_type_function();

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
  const table_name = capitalize(data.relation_table);

  if (where_input_types.has(table_name)) {
    return where_input_types.get(table_name);
  }

  const where_input_type = function whereInputType() {};

  gql_fields.get(table_name).forEach((col) => {
    if (col.field_options?.filterable) {
      decorateField(where_input_type, col.field_name, buildFilterField(col));
    }
  });

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
