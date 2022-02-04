import { GraphQLExecutionContext } from '@nestjs/graphql';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import {
  FragmentDefinitionNode,
  GraphQLResolveInfo,
  SelectionNode,
} from 'graphql';

import { manyToOneLoader } from './many-to-one.loader';
import { oneToManyLoader } from './one-to-many.loader';

export enum ELoaderType {
  MANY_TO_ONE = 'MANY_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  ONE_TO_ONE = 'ONE_TO_ONE',
  POLYMORPHIC = 'POLYMORPHIC'
}

export interface ILoaderData {
  loader_type: ELoaderType,
  field_name: string;
  relation_table: string;
  relation_fk: string;
}

export const Loader = createParamDecorator((data: ILoaderData, ctx: ExecutionContext) => {
  // const [root, args, gctx, info] = ctx.getArgs();
  const args = ctx.getArgs();

  const gctx: GraphQLExecutionContext = args[2];
  const info: GraphQLResolveInfo = args[3];

  if (!gctx[data.field_name]) {
    const selected_fields = recursiveSelectedFields(data, info.fieldNodes, info.fragments);

    switch (data.loader_type) {
      case ELoaderType.MANY_TO_ONE:
        gctx[data.field_name] = manyToOneLoader(selected_fields, data)
        break;
      case ELoaderType.ONE_TO_MANY:
        gctx[data.field_name] = oneToManyLoader(selected_fields, data)
        break;
      case ELoaderType.ONE_TO_ONE:
        break;
      case ELoaderType.POLYMORPHIC:
        break;
      default:
        break;
    }
  }

  return gctx;
});

function recursiveSelectedFields(
  data: ILoaderData,
  selectionNodes: ReadonlyArray<SelectionNode>,
  fragments: Record<string, FragmentDefinitionNode>,
) {
  let results: Set<string> = new Set([]);

  for (const node of selectionNodes) {
    if (node.kind === 'Field' && node.selectionSet && data.field_name === node.name.value) {
      for (const selection of node.selectionSet.selections) {
        if (selection.kind === 'Field' && !selection.selectionSet) {
          results.add(selection.name.value);
        } else if (selection.kind === 'FragmentSpread') {
          const fragment = fragments[selection.name.value]

          if (fragment.selectionSet) {
            results = new Set([
              ...results,
              ...recursiveSelectedFields(data, fragment.selectionSet.selections, fragments)
            ])
          }
        } else if (selection.kind === 'InlineFragment' && selection.selectionSet) {
          results = new Set([
            ...results,
            ...recursiveSelectedFields(data, selection.selectionSet.selections, fragments)
          ])
        }
      } 
    } else if (node.kind === 'Field' && !node.selectionSet) {
      results.add(node.name.value);
    } else if (node.kind === 'InlineFragment' && node.selectionSet) {
      results = new Set([
        ...results,
        ...recursiveSelectedFields(data, node.selectionSet.selections, fragments)
      ])
    } else if (node.kind === 'FragmentSpread') {
      const fragment = fragments[node.name.value];

      if (fragment.selectionSet) {
        results = new Set([
          ...results,
          ...recursiveSelectedFields(data, fragment.selectionSet.selections, fragments)
        ])
      }
    }
  }

  return results;
}
