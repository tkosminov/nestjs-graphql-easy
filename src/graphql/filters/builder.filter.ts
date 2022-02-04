import { ID, InputType, Field, FieldOptions, ReturnTypeFunc, Int, Float } from '@nestjs/graphql';

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
  // ILIKE = 'ILIKE',
  // NOT_ILIKE = 'NOT ILIKE',
  // BETWEEN = 'BETWEEN',
  // NOT_BETWEEN = 'NOT BETWEEN',
  // GT = '>',
  // GTE = '>=',
  // LT = '<',
  // LTE = '<=',
}

const where_input_types: Map<string, ReturnTypeFunc> = new Map();
const field_input_types: Map<string, ReturnTypeFunc> = new Map();

// const common_types = [ID, Int, Float, Boolean, String, Date]

const decorateField = (clazz: any, field_name: string, field_type: ReturnTypeFunc, field_options?: FieldOptions) => {
  clazz.prototype[field_name] = Field(field_type, {
    ...field_options,
    nullable: true,
  })(clazz.prototype, field_name);
};

const buildField = (relation_table: string, column: ColumnMetadataArgs): ReturnTypeFunc => {
  const name = `${column.propertyName}_${relation_table}`;

  if (field_input_types.has(name)) {
    return field_input_types.get(name);
  }

  let col_type: any = String;

  if (column.options?.type) {
    if (typeof column.options.type === 'function' && ['String', 'Number', 'Boolean'].includes(column.options.type['name'])) {
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
        default:
          col_type = String;
          break;
      }
    }
  }

  const field_input_type = function fieldInputType() {};

  Object.keys(EOperationQuery).forEach((operation) => {
    switch (EOperationQuery[operation]) {
      case EOperationQuery.NULL:
      case EOperationQuery.NOT_NULL:
        decorateField(field_input_type, operation, () => Boolean, {
          nullable: true,
        });
        break;
      case EOperationQuery.IN:
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

  Object.defineProperty(field_input_type, 'name', {
    value: `${name}FilterInputType`,
  });

  InputType()(field_input_type);

  return () => field_input_type;
};

export const buildFilter = (data: IFilterData): ReturnTypeFunc => {
  const table_name = capitalize(data.relation_table);

  if (where_input_types.has(table_name)) {
    return where_input_types.get(table_name);
  }

  const where_input_type = function whereInputType() {};

  const typeorm_metadata = getMetadataArgsStorage();

  typeorm_metadata.columns
    .filter((col) => {
      return [table_name, 'EntityHelper'].includes(col.target['name']);
    })
    .forEach((col) => {
      if (!(col.options?.type && typeof col.options.type === 'string' && ['json', 'jsonb'].includes(col.options.type))) {
        decorateField(where_input_type, col.propertyName, buildField(table_name, col));
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
