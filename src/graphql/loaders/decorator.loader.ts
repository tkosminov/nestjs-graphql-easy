/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { GraphQLExecutionContext } from '@nestjs/graphql';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { getRepository } from 'typeorm';
import { singular, isSingular } from 'pluralize';
import {
  FragmentDefinitionNode,
  GraphQLResolveInfo,
  SelectionNode,
} from 'graphql';

import { manyToOneLoader } from './many-to-one.loader';
import { oneToManyLoader } from './one-to-many.loader';

import { EntityHelper } from '../../entities/helper/entity.helper';

export const Loader = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    // const [root, args, gctx, info] = ctx.getArgs();
    const args = ctx.getArgs();
    const gctx: GraphQLExecutionContext = args[2];
    const info: GraphQLResolveInfo = args[3];

    if (data.prototype instanceof EntityHelper) {
      return getRepository(data).find({});
    } else if (typeof data === 'string') {
      const fields = Array.from(
        resolverRecursive(info.fieldNodes, data, info.fragments),
      ).map((field) => data + '.' + field);

      gctx[data] = manyToOneLoader(fields, data);
    } else {
      const entityName: string = data[0];
      const entityKey: string = data[1];

      if (!gctx[entityName]) {
        const fields = Array.from(
          resolverRecursive(info.fieldNodes, entityName, info.fragments),
        ).map((field) => singular(entityName) + '.' + field);

        gctx[entityName] = oneToManyLoader(fields, entityName, entityKey);
      }
    }

    return gctx;
  },
);

function resolverRecursive(
  resolvers: ReadonlyArray<SelectionNode>,
  field: string,
  fragments: { [key: string]: FragmentDefinitionNode },
  from_fragment = false,
): Set<string> {
  let results = new Set(['id']);

  if (from_fragment) {
    for (const resolver of resolvers) {
      if (resolver.kind === 'Field' && !resolver.selectionSet) {
        results.add(resolver.name.value);
      } else if (resolver.kind === 'FragmentSpread') {
        const fragment = fragments[resolver.name.value];

        if (fragment?.selectionSet) {
          results = new Set([
            ...results,
            ...resolverRecursive(
              fragment.selectionSet.selections,
              field,
              fragments,
              true,
            ),
          ]);
        }
      }
    }

    return results;
  }

  for (const resolver of resolvers) {
    if (resolver.kind === 'Field' && resolver.selectionSet) {
      if (resolver.name.value === field) {
        resolver.selectionSet.selections.forEach((item) => {
          if (item.kind === 'Field' && !item.selectionSet) {
            results.add(item.name.value);
          } else if (item.kind === 'Field' && item.selectionSet) {
            if (isSingular(item.name.value)) {
              results.add(item.name.value + '_id');
            }
          } else if (item.kind === 'FragmentSpread') {
            const fragment = fragments[item.name.value];

            if (fragment?.selectionSet) {
              results = new Set([
                ...results,
                ...resolverRecursive(
                  fragment.selectionSet.selections,
                  field,
                  fragments,
                  true,
                ),
              ]);
            }
          } else if (item.kind === 'InlineFragment' && item.selectionSet) {
            results = new Set([
              ...results,
              ...resolverRecursive(
                item.selectionSet.selections,
                field,
                fragments,
                true,
              ),
            ]);
          }
        });

        return results;
      } else {
        return resolverRecursive(
          resolver.selectionSet.selections,
          field,
          fragments,
          false,
        );
      }
    }
  }

  return results;
}
