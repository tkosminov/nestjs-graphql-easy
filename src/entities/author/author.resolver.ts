import { Context, GraphQLExecutionContext, Parent, Resolver } from '@nestjs/graphql';

import { Query, ResolveField, ELoaderType, Loader, Filter, Order, Pagination } from 'nestjs-graphql-easy';

import { Book } from '../book/book.entity';
import { Author } from './author.entity';

@Resolver(() => Author)
export class AuthorResolver {
  @Query(() => [Author])
  public async authors(
    @Loader({
      loader_type: ELoaderType.MANY,
      field_name: 'authors',
      entity: () => Author,
      entity_fk_key: 'id',
    })
    field_alias: string,
    @Filter(() => Author) _filter: unknown,
    @Order(() => Author) _order: unknown,
    @Pagination() _pagination: unknown,
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias];
  }

  @ResolveField(() => [Book], { nullable: true })
  public async books(
    @Parent() author: Author,
    @Loader({
      loader_type: ELoaderType.ONE_TO_MANY,
      field_name: 'books',
      entity: () => Book,
      entity_fk_key: 'author_id',
      entity_joins: [
        {
          query: 'book.author',
          alias: 'author',
        },
      ],
      entity_wheres: [
        {
          query: 'book.is_private = :is_private',
          params: { is_private: false },
        },
        {
          query: 'author.id IS NOT NULL',
        },
      ],
    })
    field_alias: string,
    @Filter(() => Book) _filter: unknown,
    @Order(() => Book) _order: unknown,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Book[]> {
    return await ctx[field_alias].load(author.id);
  }
}
