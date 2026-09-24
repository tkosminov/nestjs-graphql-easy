import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GraphQLExecutionContext, ReturnTypeFunc } from '@nestjs/graphql';

import DataLoader from 'dataloader';
import { DataSource, EntityManager, ObjectLiteral } from 'typeorm';
import { GraphQLError, GraphQLResolveInfo } from 'graphql';

import { IFilterValue, IParsedFilter, parseFilter } from '../filter/parser.js';
import { IParsedOrder, parseOrder, TOrderValue } from '../order/parser.js';
import { underscore } from '../helper/index.js';
import { IPaginationValue, IParsedPagination, parsePagination } from '../pagination/parser.js';
import { getTableColumns, getTableForeignKeys, getTablePrimaryKeys } from '../store/typeorm.js';

import { recursiveSelectedFields } from './parser.js';
import { manyToOneLoader } from './query-builder/many-to-one.js';
import { oneToManyLoader } from './query-builder/one-to-many.js';
import { oneToOneLoader } from './query-builder/one-to-one.js';
import { manyLoader } from './query-builder/many.js';

export enum ELoaderType {
  MANY_TO_ONE = 'MANY_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  ONE_TO_ONE = 'ONE_TO_ONE',
  MANY = 'MANY',
  POLYMORPHIC = 'POLYMORPHIC',
}

export interface ILoaderData {
  field_name: string;
  loader_type: ELoaderType;
  entity: ReturnTypeFunc;
  entity_fk_key: string;
  entity_fk_type?: string;
  entity_joins?: Array<{
    query: string;
    alias: string;
  }>;
  entity_wheres?: Array<{
    query: string;
    params?: Record<string, unknown>;
  }>;
}

type TGraphQLArgs = Partial<
  {
    WHERE: IFilterValue;
    ORDER: TOrderValue;
    PAGINATION: IPaginationValue;
  } & Record<string, unknown>
>;

export type TGraphQLExecutionContext = GraphQLExecutionContext & { data_source?: DataSource; entity_manager?: EntityManager } & Record<
    string,
    DataLoader<string | number, ObjectLiteral, string | number> | Promise<ObjectLiteral[]>
  >;

let data_source: DataSource | null = null;

export function setDataSource(ds: DataSource) {
  data_source = ds;
}

export const Loader = createParamDecorator((data: ILoaderData, ctx: ExecutionContext) => {
  const args = ctx.getArgs();

  const parent: Record<string, unknown> | null = args[0];
  const gql_args: TGraphQLArgs = args[1];
  const gql_ctx: TGraphQLExecutionContext = args[2];
  const info: GraphQLResolveInfo = args[3];

  let entity_class_name: string;

  if (data.loader_type === ELoaderType.POLYMORPHIC && parent && data.entity_fk_type) {
    entity_class_name = parent[data.entity_fk_type] as string;
  } else {
    entity_class_name = data.entity()['name'];
  }

  const entity_table_name = underscore(entity_class_name);
  const field_alias = entity_table_name;

  let parsed_filters: IParsedFilter | null = null;
  if (gql_args.WHERE) {
    parsed_filters = parseFilter(entity_table_name, gql_args.WHERE);
  }

  let parsed_orders: IParsedOrder[] | null = null;
  if (gql_args.ORDER) {
    parsed_orders = parseOrder(entity_table_name, gql_args.ORDER);
  }

  let parsed_pagination: IParsedPagination | null = null;
  if (gql_args.PAGINATION) {
    parsed_pagination = parsePagination(gql_args.PAGINATION);
  }

  const selected_fields = recursiveSelectedFields(data, info.fieldNodes, info.fragments);
  const entity_table_columns = getTableColumns(entity_class_name);
  const entity_table_foreign_keys = getTableForeignKeys(entity_class_name);
  const entity_table_primary_keys = getTablePrimaryKeys(entity_class_name);

  const selected_columns = new Set(Array.from(selected_fields).filter((field) => entity_table_columns.has(field)));

  entity_table_foreign_keys.forEach((fk) => {
    selected_columns.add(fk);
  });

  entity_table_primary_keys.forEach((pk) => {
    selected_columns.add(pk);
  });

  if (!gql_ctx['entity_manager']) {
    if (data_source) {
      gql_ctx['entity_manager'] = data_source.createEntityManager();
    } else if (gql_ctx?.data_source) {
      gql_ctx['entity_manager'] = gql_ctx.data_source.createEntityManager();
    } else {
      throw new GraphQLError('INVALID_DATA_SOURCE', {
        originalError: new Error('INVALID_DATA_SOURCE'),
        extensions: {
          code: 'INVALID_DATA_SOURCE',
        },
      });
    }
  }

  switch (data.loader_type) {
    case ELoaderType.MANY_TO_ONE:
      gql_ctx[field_alias] = manyToOneLoader(gql_ctx['entity_manager'], selected_columns, entity_table_name, data);

      break;
    case ELoaderType.ONE_TO_MANY:
      gql_ctx[field_alias] = oneToManyLoader(
        gql_ctx['entity_manager'],
        selected_columns,
        entity_table_name,
        data,
        parsed_filters,
        parsed_orders
      );

      break;
    case ELoaderType.ONE_TO_ONE:
      gql_ctx[field_alias] = oneToOneLoader(gql_ctx['entity_manager'], selected_columns, entity_table_name, data);

      break;
    case ELoaderType.MANY:
      gql_ctx[field_alias] = manyLoader(
        gql_ctx['entity_manager'],
        selected_columns,
        entity_table_name,
        data,
        parsed_filters,
        parsed_orders,
        parsed_pagination
      );

      break;
    case ELoaderType.POLYMORPHIC:
      gql_ctx[field_alias] = oneToOneLoader(gql_ctx['entity_manager'], selected_columns, entity_table_name, data);

      break;
    default:
      break;
  }

  return field_alias;
});
