import { EOrderMethod, EOrderNulls, EOrderQuery } from './builder.order';

export interface IOrderKeyValue {
  [EOrderQuery.SORT]: EOrderMethod;
  [EOrderQuery.NULLS]: EOrderNulls | null;
  [EOrderQuery.PRIORITY]: number | null;
}

export type TOrderValue = Record<string, IOrderKeyValue>;

export interface IParsedOrder {
  sort: string;
  order?: 'ASC' | 'DESC';
  nulls?: 'NULLS FIRST' | 'NULLS LAST';
}

export function parseOrder(relation_table: string, data: TOrderValue) {
  const orders: IParsedOrder[] = [];

  Object.entries(data)
    .sort(([_key_a, value_a], [_key_b, value_b]) => {
      return (value_a[EOrderQuery.PRIORITY] || 0) - (value_b[EOrderQuery.PRIORITY] || 0);
    })
    .forEach(([key, value]) => {
      if (value && value[EOrderQuery.SORT]) {
        const parsed_order: IParsedOrder = {
          sort: `${relation_table}.${key}`,
          order: EOrderMethod[value[EOrderQuery.SORT]],
        };

        if (value[EOrderQuery.NULLS]) {
          parsed_order.nulls = `${EOrderQuery.NULLS} ${EOrderNulls[value[EOrderQuery.NULLS]] as EOrderNulls}`;
        }

        orders.push(parsed_order);
      }
    });

  return orders;
}
