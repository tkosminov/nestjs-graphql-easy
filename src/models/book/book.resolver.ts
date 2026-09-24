import { Context, type GraphQLExecutionContext, Parent, Resolver } from '@nestjs/graphql';

import { Query, ResolveField, ELoaderType, Loader, Filter, Order, Pagination } from 'nestjs-graphql-easy';

import { Author } from '../author/author.entity.js';
import { Section } from '../section/section.entity.js';
import { Book } from './book.entity.js';

@Resolver(() => Book)
export class BookResolver {
  @Query(() => [Book], { nullable: false })
  protected async books(
    @Loader({
      loader_type: ELoaderType.MANY,
      field_name: 'books',
      entity: () => Book,
      entity_fk_key: 'id',
    })
    field_alias: string,
    @Filter(() => Book) _filter: unknown,
    @Order(() => Book) _order: unknown,
    @Pagination() _pagination: unknown,
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias];
  }

  @ResolveField(() => Author, { nullable: false })
  protected async author(
    @Parent() book: Book,
    @Loader({
      loader_type: ELoaderType.MANY_TO_ONE,
      field_name: 'author',
      entity: () => Author,
      entity_fk_key: 'id',
    })
    field_alias: string,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Author> {
    return await ctx[field_alias].load(book.author_id);
  }

  @ResolveField(() => [Section], { nullable: true })
  protected async sections(
    @Parent() book: Book,
    @Loader({
      loader_type: ELoaderType.ONE_TO_MANY,
      field_name: 'sections',
      entity: () => Section,
      entity_fk_key: 'book_id',
    })
    field_alias: string,
    @Filter(() => Section) _filter: unknown,
    @Order(() => Section) _order: unknown,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Section[]> {
    return await ctx[field_alias].load(book.id);
  }
}
