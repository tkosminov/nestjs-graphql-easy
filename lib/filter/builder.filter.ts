/* eslint-disable @typescript-eslint/no-empty-function */
import { InputType, ReturnTypeFunc, Int, Float, GqlTypeReference, ID } from '@nestjs/graphql';

import { decorateField, where_field_input_types, where_input_types, gql_fields, gql_enums, IField, EDataType } from '../store/graphql';

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
const precision_types: GqlTypeReference[] = [ID, Int, Float, Number, Date];
const other_types: GqlTypeReference[] = [Boolean];

function findEnumName(col_type: GqlTypeReference) {
  let col_type_name: string = null;

  gql_enums.forEach((e) => {
    if (e.type_function() === col_type) {
      col_type_name = e.name;

      return;
    }
  });

  return col_type_name;
}

const buildFilterField = (column: IField): ReturnTypeFunc => {
  const col_type: GqlTypeReference = column.type_function();

  let col_type_name: string = col_type['name'];

  if (col_type_name == null) {
    col_type_name = findEnumName(col_type);
  }

  const name = `${col_type_name}_FilterInputType`;

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

  let allow_filters_from = column.options?.allow_filters_from;

  if ((string_types.includes(col_type) || precision_types.includes(col_type) || other_types.includes(col_type)) && allow_filters_from) {
    allow_filters_from = undefined;
  }

  if (string_types.includes(col_type) || allow_filters_from?.includes(EDataType.STRING)) {
    string_operations.forEach((operation) => {
      decorateField(field_input_type, operation, () => col_type, {
        nullable: true,
      });
    });
  }

  if (precision_types.includes(col_type) || allow_filters_from?.includes(EDataType.PRECISION)) {
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

export const buildFilter = (enity: ReturnTypeFunc): ReturnTypeFunc => {
  const entity_class_name = enity()['name'];

  if (where_input_types.has(entity_class_name)) {
    return where_input_types.get(entity_class_name);
  }

  const where_input_type = function whereInputType() {};

  gql_fields.get(entity_class_name).forEach((col) => {
    if (col.options?.filterable) {
      decorateField(where_input_type, col.name, buildFilterField(col));
    }
  });

  Object.values(EFilterOperator).forEach((operator) => {
    decorateField(where_input_type, operator, () => [where_input_type]);
  });

  Object.defineProperty(where_input_type, 'name', {
    value: `${entity_class_name}_FilterInputType`,
  });

  InputType()(where_input_type);

  where_input_types.set(entity_class_name, () => where_input_type);

  return () => where_input_type;
};
