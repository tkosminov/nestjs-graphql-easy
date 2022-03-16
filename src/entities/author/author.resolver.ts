import { Args, Context, GraphQLExecutionContext, ID, Parent, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Query, ResolveField, ELoaderType, Loader, Filter, Order, Pagination, middlewares, guards } from '@gql';

import { Book } from '../book/book.entity';
import { Author } from './author.entity';
import { AuthorService } from './author.service';

@Resolver(() => Author)
export class AuthorResolver {
  constructor(private readonly authorService: AuthorService) {}

  @UseGuards(guards.auth)
  @Query(() => [Author])
  public async authors(
    @Loader({
      loader_type: ELoaderType.MANY,
      field_name: 'authors',
      relation_table: 'author',
      relation_fk: 'id',
    })
    field_alias: string,
    @Filter({
      relation_table: 'author',
    })
    _filter: unknown,
    @Order({
      relation_table: 'author',
    })
    _order: unknown,
    @Pagination() _pagination: unknown,
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias];
  }

  @Query(() => Author)
  public async author(@Args({ name: 'id', type: () => ID }) id: string) {
    return await this.authorService.findOne(id);
  }

  @ResolveField(() => [Book], { nullable: true, middleware: [middlewares.role] })
  public async books(
    @Parent() author: Author,
    @Loader({
      loader_type: ELoaderType.ONE_TO_MANY,
      field_name: 'books',
      relation_table: 'book',
      relation_fk: 'author_id',
      relation_where: {
        query: 'book.is_private = :is_private',
        params: { is_private: false },
      },
    })
    field_alias: string,
    @Filter({
      relation_table: 'book',
    })
    _filter: unknown,
    @Order({
      relation_table: 'book',
    })
    _order: unknown,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Book[]> {
    return await ctx[field_alias].load(author.id);
  }
}
