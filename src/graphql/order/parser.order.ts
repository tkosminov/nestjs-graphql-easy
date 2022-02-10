import { OrderByCondition } from "typeorm";

import { EOrderMethod, EOrderNulls, EOrderQuery } from "./builder.order";

export type IOrderValue = Record<string, Record<EOrderQuery, EOrderMethod | EOrderNulls>>;

export function parseOrder(relation_table: string, data: IOrderValue) {
  let order: OrderByCondition = {}

  Object.entries(data).forEach(([key, value]) => {
    if (value && value[EOrderQuery.SORT]) {

      if (value[EOrderQuery.NULLS]) {
        order[`${relation_table}.${key}`] = {
          order: EOrderMethod[value[EOrderQuery.SORT]],
          nulls: `${EOrderQuery.NULLS} ${EOrderNulls[value[EOrderQuery.NULLS]] as EOrderNulls}`
        }
      } else {
        order[`${relation_table}.${key}`] = EOrderMethod[value[EOrderQuery.SORT]]
      }
    }
  })

  return order;
}
