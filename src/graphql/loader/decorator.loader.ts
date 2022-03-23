import { GraphQLExecutionContext } from '@nestjs/graphql';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { FragmentDefinitionNode, GraphQLResolveInfo, SelectionNode } from 'graphql';
import { OrderByCondition } from 'typeorm';

import { IFilterValue, IParsedFilter, parseFilter } from '../filter/parser.filter';
import { IOrderValue, parseOrder } from '../order/parser.order';
import { IPaginationValue, IParsedPagination, parsePagination } from '../pagination/parser.pagination';

import { manyToOneLoader } from './many-to-one.loader';
import { oneToManyLoader } from './one-to-many.loader';
import { manyLoader } from './many.loader';
import { oneToOneLoader } from './one-to-one.loader';
import { underscore } from '@helpers/string.helper';
import { getTableColumns } from '../store';

export enum ELoaderType {
  MANY_TO_ONE = 'MANY_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  ONE_TO_ONE = 'ONE_TO_ONE',
  MANY = 'MANY',
  POLYMORPHIC = 'POLYMORPHIC',
}

export interface ILoaderData {
  loader_type: ELoaderType;
  field_name: string;
  relation_table?: string;
  relation_fk: string;
  relation_where?: {
    query: string;
    params?: Record<string, unknown>;
  };
}

export const Loader = createParamDecorator((data: ILoaderData, ctx: ExecutionContext) => {
  // const [root, args, gctx, info] = ctx.getArgs();
  const args = ctx.getArgs();

  const parent: Record<string, unknown> | null = args[0];
  const gargs: Record<string, any> | undefined | null = args[1];
  const gctx: GraphQLExecutionContext = args[2];
  const info: GraphQLResolveInfo = args[3];

  let field_alias = data.field_name;

  const filters = gargs['WHERE'];
  let parsed_filters: IParsedFilter = null;

  if (filters) {
    parsed_filters = parseFilter(data.relation_table, filters as IFilterValue);
  }

  const orders = gargs['ORDER'];
  let parsed_orders: OrderByCondition = null;

  if (orders) {
    parsed_orders = parseOrder(data.relation_table, orders as IOrderValue);
  }

  const paginations = gargs['PAGINATION'];
  let parsed_paginations: IParsedPagination = null;

  if (paginations) {
    parsed_paginations = parsePagination(paginations as IPaginationValue);
  }

  const selected_fields = recursiveSelectedFields(data, info.fieldNodes, info.fragments);

  switch (data.loader_type) {
    case ELoaderType.MANY_TO_ONE:
      gctx[field_alias] = manyToOneLoader(selected_fields, data);
      break;
    case ELoaderType.ONE_TO_MANY:
      gctx[field_alias] = oneToManyLoader(selected_fields, data, parsed_filters, parsed_orders);
      break;
    case ELoaderType.ONE_TO_ONE:
      gctx[field_alias] = oneToOneLoader(selected_fields, data);
      break;
    case ELoaderType.MANY:
      gctx[field_alias] = manyLoader(selected_fields, data, parsed_filters, parsed_orders, parsed_paginations);
      break;
    case ELoaderType.POLYMORPHIC:
      const table_name = underscore(parent['itemable_type'] as string);
      field_alias = table_name;

      const table_cols = getTableColumns(parent['itemable_type'] as string);
      const fields = new Set(Array.from(selected_fields).filter((field) => table_cols.has(field)));

      gctx[field_alias] = oneToOneLoader(fields, { ...data, ...{ relation_table: table_name } });
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
