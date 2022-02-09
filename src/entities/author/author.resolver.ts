import { Args, Context, GraphQLExecutionContext, ID, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { ELoaderType, Loader } from '../../graphql/loaders/decorator.loader';
import { Book } from '../book/book.entity';
import { Filter } from '../../graphql/filters/decorator.filter';

import { Author } from './author.entity';
import { AuthorService } from './author.service';

@Resolver(() => Author)
export class AuthorResolver {
  constructor(private readonly authorService: AuthorService) {}

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
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias];
  }

  @Query(() => Author)
  public async author(@Args({ name: 'id', type: () => ID }) id: string) {
    return await this.authorService.findOne(id);
  }

  @ResolveField()
  public async books(
    @Parent() author: Author,
    @Loader({
      loader_type: ELoaderType.ONE_TO_MANY,
      field_name: 'books',
      relation_table: 'book',
      relation_fk: 'author_id',
    })
    field_alias: string,
    @Filter({
      relation_table: 'book',
    })
    _filter: unknown,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Book[]> {
    return await ctx[field_alias].load(author.id);
  }
}
