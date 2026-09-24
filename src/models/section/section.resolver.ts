import { Context, type GraphQLExecutionContext, Parent, Resolver } from '@nestjs/graphql';

import { Query, ResolveField, ELoaderType, Loader, Filter, Order, Pagination } from 'nestjs-graphql-easy';

import { Book } from '../book/book.entity.js';
import { Section } from './section.entity.js';

import { Item } from '../item/item.entity.js';

@Resolver(() => Section)
export class SectionResolver {
  @Query(() => [Section], { nullable: false })
  protected async sections(
    @Loader({
      loader_type: ELoaderType.MANY,
      field_name: 'sections',
      entity: () => Section,
      entity_fk_key: 'id',
    })
    field_alias: string,
    @Filter(() => Section) _filter: unknown,
    @Order(() => Section) _order: unknown,
    @Pagination() _pagination: unknown,
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias];
  }

  @ResolveField(() => Book, { nullable: false })
  protected async book(
    @Parent() section: Section,
    @Loader({
      loader_type: ELoaderType.MANY_TO_ONE,
      field_name: 'book',
      entity: () => Book,
      entity_fk_key: 'id',
    })
    field_alias: string,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Book> {
    return await ctx[field_alias].load(section.book_id);
  }

  @ResolveField(() => [Item], { nullable: true })
  protected async items(
    @Parent() section: Section,
    @Loader({
      loader_type: ELoaderType.ONE_TO_MANY,
      field_name: 'items',
      entity: () => Item,
      entity_fk_key: 'section_id',
    })
    field_alias: string,
    @Filter(() => Item) _filter: unknown,
    @Order(() => Item) _order: unknown,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Section[]> {
    return await ctx[field_alias].load(section.id);
  }
}
