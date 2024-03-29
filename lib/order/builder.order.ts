/* eslint-disable @typescript-eslint/no-empty-function */
import { InputType, Int, ReturnTypeFunc } from '@nestjs/graphql';

import { decorateField, order_field_input_types, order_input_types, gql_fields, IField, registerEnumType } from '../store/graphql';

export enum EOrderQuery {
  SORT = 'SORT',
  NULLS = 'NULLS',
  PRIORITY = 'PRIORITY',
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

const buildOrderField = (_column: IField): ReturnTypeFunc => {
  const name = 'field_OrderInputType';

  if (order_field_input_types.has(name)) {
    return order_field_input_types.get(name);
  }

  const field_input_type = function fieldInputType() {};

  decorateField(field_input_type, EOrderQuery.SORT, () => EOrderMethod, {
    nullable: false,
  });

  decorateField(field_input_type, EOrderQuery.NULLS, () => EOrderNulls, {
    nullable: true,
  });

  decorateField(field_input_type, EOrderQuery.PRIORITY, () => Int, {
    nullable: true,
  });

  Object.defineProperty(field_input_type, 'name', {
    value: name,
  });

  InputType()(field_input_type);

  order_field_input_types.set(name, () => field_input_type);

  return () => field_input_type;
};

export const buildOrder = (enity: ReturnTypeFunc): ReturnTypeFunc => {
  const entity_class_name = enity()['name'];

  if (order_input_types.has(entity_class_name)) {
    return order_input_types.get(entity_class_name);
  }

  const order_input_type = function orderInputType() {};

  gql_fields.get(entity_class_name).forEach((col) => {
    if (col.options?.sortable) {
      decorateField(order_input_type, col.name, buildOrderField(col), {
        nullable: true,
      });
    }
  });

  Object.defineProperty(order_input_type, 'name', {
    value: `${entity_class_name}_OrderInputType`,
  });

  InputType()(order_input_type);

  order_input_types.set(entity_class_name, () => order_input_type);

  return () => order_input_type;
};
