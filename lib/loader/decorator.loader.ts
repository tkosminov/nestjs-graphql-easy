import { GraphQLExecutionContext, ReturnTypeFunc } from '@nestjs/graphql';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { FragmentDefinitionNode, GraphQLResolveInfo, SelectionNode } from 'graphql';
import { DataSource, EntityManager } from 'typeorm';

import { underscore } from '../helper';

import { IFilterValue, IParsedFilter, parseFilter } from '../filter/parser.filter';
import { TOrderValue, IParsedOrder, parseOrder } from '../order/parser.order';
import { IPaginationValue, IParsedPagination, parsePagination } from '../pagination/parser.pagination';
import { getTableColumns, getTableForeignKeys, getTablePrimaryKeys } from '../store';
import { invalid_data_source } from '../error';

import { manyToOneLoader } from './many-to-one.loader';
import { oneToManyLoader } from './one-to-many.loader';
import { manyLoader } from './many.loader';
import { oneToOneLoader } from './one-to-one.loader';

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

export interface IPrivateLoaderData extends ILoaderData {
  entity_manager?: EntityManager;
}

let data_source: DataSource = null;

export function setDataSource(ds: DataSource) {
  data_source = ds;
}

export const Loader = createParamDecorator((data: ILoaderData, ctx: ExecutionContext) => {
  const args = ctx.getArgs();

  const _data: IPrivateLoaderData = data;

  const parent: Record<string, unknown> | null = args[0];
  const gargs: Record<string, any> | undefined | null = args[1];
  const gctx: GraphQLExecutionContext & { data_source: DataSource } = args[2];
  const info: GraphQLResolveInfo = args[3];

  let entity_class_name: string;

  if (_data.loader_type === ELoaderType.POLYMORPHIC) {
    entity_class_name = parent[_data.entity_fk_type] as string;
  } else {
    entity_class_name = _data.entity()['name'];
  }

  const entity_table_name = underscore(entity_class_name);
  const field_alias = entity_table_name;

  const filters: IFilterValue | undefined = gargs['WHERE'];
  let parsed_filters: IParsedFilter = null;

  if (filters) {
    parsed_filters = parseFilter(entity_table_name, filters);
  }

  const orders: TOrderValue | undefined = gargs['ORDER'];
  let parsed_orders: IParsedOrder[] = null;

  if (orders) {
    parsed_orders = parseOrder(entity_table_name, orders);
  }

  const paginations: IPaginationValue | undefined = gargs['PAGINATION'];
  let parsed_paginations: IParsedPagination = null;

  if (paginations) {
    parsed_paginations = parsePagination(paginations);
  }

  const selected_fields = recursiveSelectedFields(_data, info.fieldNodes, info.fragments);
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

  if (!_data.entity_manager) {
    if (!gctx['entity_manager']) {
      if (data_source) {
        gctx['entity_manager'] = data_source.createEntityManager();
      } else if (gctx?.data_source) {
        gctx['entity_manager'] = gctx.data_source.createEntityManager();
      } else {
        invalid_data_source({ raise: true });
      }
    }

    _data.entity_manager = gctx['entity_manager'];
  }

  switch (_data.loader_type) {
    case ELoaderType.MANY_TO_ONE:
      gctx[field_alias] = manyToOneLoader(selected_columns, entity_table_name, _data);
      break;
    case ELoaderType.ONE_TO_MANY:
      gctx[field_alias] = oneToManyLoader(selected_columns, entity_table_name, _data, parsed_filters, parsed_orders);
      break;
    case ELoaderType.ONE_TO_ONE:
      gctx[field_alias] = oneToOneLoader(selected_columns, entity_table_name, _data);
      break;
    case ELoaderType.MANY:
      gctx[field_alias] = manyLoader(selected_columns, entity_table_name, _data, parsed_filters, parsed_orders, parsed_paginations);
      break;
    case ELoaderType.POLYMORPHIC:
      gctx[field_alias] = oneToOneLoader(selected_columns, entity_table_name, _data);
      break;
    default:
      break;
  }

  return field_alias;
});

function recursiveSelectedFields(
  data: ILoaderData,
  selectionNodes: ReadonlyArray<SelectionNode>,
  fragments: Record<string, FragmentDefinitionNode>
) {
  let results: Set<string> = new Set([]);

  for (const node of selectionNodes) {
    if (node.kind === 'Field' && node.selectionSet && data.field_name === node.name.value) {
      for (const selection of node.selectionSet.selections) {
        if (selection.kind === 'Field' && !selection.selectionSet) {
          results.add(selection.name.value);
        } else if (selection.kind === 'FragmentSpread') {
          const fragment = fragments[selection.name.value];

          if (fragment.selectionSet) {
            results = new Set([...results, ...recursiveSelectedFields(data, fragment.selectionSet.selections, fragments)]);
          }
        } else if (selection.kind === 'InlineFragment' && selection.selectionSet) {
          results = new Set([...results, ...recursiveSelectedFields(data, selection.selectionSet.selections, fragments)]);
        }
      }
    } else if (node.kind === 'Field' && !node.selectionSet) {
      results.add(node.name.value);
    } else if (node.kind === 'InlineFragment' && node.selectionSet) {
      results = new Set([...results, ...recursiveSelectedFields(data, node.selectionSet.selections, fragments)]);
    } else if (node.kind === 'FragmentSpread') {
      const fragment = fragments[node.name.value];

      if (fragment.selectionSet) {
        results = new Set([...results, ...recursiveSelectedFields(data, fragment.selectionSet.selections, fragments)]);
      }
    }
  }

  return results;
}
