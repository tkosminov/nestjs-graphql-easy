import { Context, type GraphQLExecutionContext, Parent, Resolver } from '@nestjs/graphql';

import { Query, ResolveField, ELoaderType, Loader, Filter, Order, Pagination } from 'nestjs-graphql-easy';

import { Section } from '../section/section.entity.js';

import { Item } from './item.entity.js';
import { ItemableType } from './item.itemable.js';

@Resolver(() => Item)
export class ItemResolver {
  @Query(() => [Item], { nullable: false })
  protected async items(
    @Loader({
      loader_type: ELoaderType.MANY,
      field_name: 'items',
      entity: () => Item,
      entity_fk_key: 'id',
    })
    field_alias: string,
    @Filter(() => Item) _filter: unknown,
    @Order(() => Item) _order: unknown,
    @Pagination() _pagination: unknown,
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias];
  }

  @ResolveField(() => Section, { nullable: false })
  protected async section(
    @Parent() item: Item,
    @Loader({
      loader_type: ELoaderType.MANY_TO_ONE,
      field_name: 'section',
      entity: () => Section,
      entity_fk_key: 'id',
    })
    field_alias: string,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Section> {
    return await ctx[field_alias].load(item.section_id);
  }

  @ResolveField(() => ItemableType, { nullable: false })
  protected async itemable(
    @Parent() item: Item,
    @Loader({
      loader_type: ELoaderType.POLYMORPHIC,
      field_name: 'itemable',
      entity: () => ItemableType,
      entity_fk_key: 'id',
      entity_fk_type: 'itemable_type',
    })
    field_alias: string,
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias].load(item.itemable_id);
  }
}
