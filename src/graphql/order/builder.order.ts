/* eslint-disable @typescript-eslint/no-empty-function */

import { InputType, registerEnumType, ReturnTypeFunc } from '@nestjs/graphql';
import { ColumnMetadataArgs } from 'typeorm/metadata-args/ColumnMetadataArgs';

import { capitalize } from '../../helpers/string.helper';
import { decorateField, order_field_input_types, order_input_types, parseColumns, table_columns } from '../store/store';
import { IOrderData } from './decorator.order';

export enum EOrderQuery {
  SORT = 'SORT',
  NULLS = 'NULLS'
}

export enum EOrderMethod {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum EOrderNulls {
  LAST = 'LAST',
  FIRST = 'FIRST',
}

registerEnumType(EOrderMethod, {
  name: 'EOrderMethod',
});

registerEnumType(EOrderNulls, {
  name: 'EOrderNulls',
});

const buildOrderField = (_column: ColumnMetadataArgs): ReturnTypeFunc => {
  const name = 'field_OrderInputType';

  if (order_field_input_types.has(name)) {
    return order_field_input_types.get(name);
  }

  const field_input_type = function fieldInputType() {};

  decorateField(field_input_type, EOrderQuery.SORT, () => EOrderMethod, {
    nullable: false,
  });

  decorateField(field_input_type, EOrderQuery.NULLS, () => EOrderNulls, {
    nullable: false,
  });

  Object.defineProperty(field_input_type, 'name', {
    value: name,
  });

  InputType()(field_input_type);

  order_field_input_types.set(name, () => field_input_type);

  return () => field_input_type;
}

export const buildOrder = (data: IOrderData): ReturnTypeFunc => {
  parseColumns()

  const table_name = capitalize(data.relation_table);

  if (order_input_types.has(table_name)) {
    return order_input_types.get(table_name);
  }

  const order_input_type = function orderInputType() {};

  table_columns.get(table_name).forEach((col) => {
    decorateField(order_input_type, col.propertyName, buildOrderField(col));
  })

  Object.defineProperty(order_input_type, 'name', {
    value: `${table_name}OrderInputType`,
  });

  InputType()(order_input_type);

  order_input_types.set(table_name, () => order_input_type);

  return () => order_input_type;
}
