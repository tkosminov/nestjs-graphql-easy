import { EOrderMethod, EOrderNulls, EOrderQuery } from './builder.order';

export type IOrderValue = Record<string, Record<EOrderQuery, EOrderMethod | EOrderNulls>>;

export interface IParsedOrder {
  sort: string;
  order?: 'ASC' | 'DESC';
  nulls?: 'NULLS FIRST' | 'NULLS LAST';
}

export function parseOrder(relation_table: string, data: IOrderValue) {
  const orders: IParsedOrder[] = [];

  Object.entries(data).forEach(([key, value]) => {
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
