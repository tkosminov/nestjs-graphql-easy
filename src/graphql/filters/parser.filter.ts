import { customAlphabet } from 'nanoid';

import { EFilterOperator, EFilterOperation } from './builder.filter';

export type IFilterValue = Record<string, unknown>;

export interface IParsedFilter {
  query: string;
  params: IFilterValue;
}

const nanoid = customAlphabet('1234567890abcdef', 10);

function recursiveParseFilter(relation_table: string, data: IFilterValue, field?: string) {
  let query = '';
  let params = {};

  Object.entries(data).forEach(([key, value], index) => {
    if (key === EFilterOperator.AND || key === EFilterOperator.OR) {
      let results = ` ${EFilterOperator[key]} (`;

      (value as IFilterValue[]).forEach((v, i) => {
        const res = recursiveParseFilter(relation_table, v);

        if (i > 0 && !v[EFilterOperator.AND] && !v[EFilterOperator.OR]) {
          results += ' AND ';
        }

        results += res.query;

        params = { ...params, ...res.params };
      });

      results += ')';

      query += results;
    } else if (field) {
      const param_key = nanoid();

      if (index > 0) {
        query += ' AND ';
      }

      switch (EFilterOperation[key]) {
        case EFilterOperation.EQ:
        case EFilterOperation.NOT_EQ:
        case EFilterOperation.GT:
        case EFilterOperation.GTE:
        case EFilterOperation.LT:
        case EFilterOperation.LTE:
          params[param_key] = value;
          query += `${relation_table}.${field} ${EFilterOperation[key]} :${param_key}`;
          break;
        case EFilterOperation.NULL:
          if (!!value) {
            query += `${relation_table}.${field} ${EFilterOperation.NULL}`;
          } else {
            query += `${relation_table}.${field} ${EFilterOperation.NOT_NULL}`;
          }
          break;
        case EFilterOperation.NOT_NULL:
          if (!!value) {
            query += `${relation_table}.${field} ${EFilterOperation.NOT_NULL}`;
          } else {
            query += `${relation_table}.${field} ${EFilterOperation.NULL}`;
          }
          break;
        case EFilterOperation.IN:
        case EFilterOperation.NOT_IN:
          params[param_key] = value;
          query += `${relation_table}.${field} ${EFilterOperation[key]} (:...${param_key})`;
          break;
        case EFilterOperation.ILIKE:
        case EFilterOperation.NOT_ILIKE:
          params[param_key] = value;
          query += `${relation_table}.${field} ${EFilterOperation[key]} '%' || :${param_key} || '%'`;
          break;
      }
    } else {
      const res = recursiveParseFilter(relation_table, value as IFilterValue, key);

      if (index > 0) {
        query += ' AND ';
      }

      query += res.query;
      params = { ...params, ...res.params };
    }
  });

  return { query, params };
}

export function parseFilter(relation_table: string, data: IFilterValue) {
  return recursiveParseFilter(relation_table, data);
}
