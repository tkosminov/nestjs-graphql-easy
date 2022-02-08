import { customAlphabet } from 'nanoid';
import { getConnection } from 'typeorm';

import { EOperatorQuery, EOperationQuery } from './builder.filter';

type IFilterData = Record<string, unknown>

const nanoid = customAlphabet('1234567890abcdef', 10)

function recursiveParseFilter(relation_table: string, data: IFilterData, field?: string) {
  let query = '';
  let params = {};

  Object.entries(data).forEach(([key, value], index) => {
    if (key === EOperatorQuery.AND || key === EOperatorQuery.OR) {
      let results = ` ${EOperatorQuery[key]} (`;

      (value as IFilterData[]).forEach((v, i) => {
        const res = recursiveParseFilter(relation_table, v)

        if (i > 0 && !v[EOperatorQuery.AND] && !v[EOperatorQuery.OR]) {
          results += ' AND '
        }

        results += res.query

        params = { ...params, ...res.params }
      })

      results += ')'

      query += results
    } else if (field) {
      const param_key = nanoid();

      if (index > 0) {
        query += ' AND '
      }

      switch (EOperationQuery[key]) {
        case EOperationQuery.EQ:
        case EOperationQuery.NOT_EQ:
        case EOperationQuery.GT:
        case EOperationQuery.GTE:
        case EOperationQuery.LT:
        case EOperationQuery.LTE:
          params[param_key] = value;
          query += `${relation_table}.${field} ${EOperationQuery[key]} :${param_key}`
          break;
        case EOperationQuery.NULL:
          if (!!value) {
            query += `${relation_table}.${field} ${EOperationQuery.NULL}`
          } else {
            query += `${relation_table}.${field} ${EOperationQuery.NOT_NULL}`
          }
          break;
        case EOperationQuery.NOT_NULL:
          if (!!value) {
            query += `${relation_table}.${field} ${EOperationQuery.NOT_NULL}`
          } else {
            query += `${relation_table}.${field} ${EOperationQuery.NULL}`
          }
          break;
        case EOperationQuery.IN:
        case EOperationQuery.NOT_IN:
          params[param_key] = value;
          query += `${relation_table}.${field} ${EOperationQuery[key]} (:...${param_key})`
          break;
        case EOperationQuery.ILIKE:
        case EOperationQuery.NOT_ILIKE:
          params[param_key] = value;
          query += `${relation_table}.${field} ${EOperationQuery[key]} '%' || :${param_key} || '%'`
          break;
      }
    } else {
      const res = recursiveParseFilter(relation_table, value as IFilterData, key)

      query += res.query
      params = { ...params, ...res.params }
    }
  })

  return { query, params };
}

export function parseFilter(relation_table: string, data: IFilterData) {
  const { query, params } = recursiveParseFilter(relation_table, data);

  return getConnection().driver.escapeQueryWithParameters(query, params, {})
}