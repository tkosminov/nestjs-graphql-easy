import { Args, Context, GraphQLExecutionContext, ID, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Author } from './author.entity';
import { AuthorService } from './author.service';

import { ELoaderType, Loader } from '../../graphql/loaders/decorator.loader';
import { Book } from '../book/book.entity';
import { Filter } from '../../graphql/filters/decorator.filter';
import { parseFilter } from '../../graphql/filters/parser.filter';

@Resolver(() => Author)
export class AuthorResolver {
  constructor(private readonly authorService: AuthorService) {}

  @Query(() => [Author])
  public async authors(
    @Filter({
      relation_table: 'author',
    })
    _rpf: any
  ) {
    const res = parseFilter('author', _rpf);
    console.log(JSON.stringify(res))
    return await this.authorService.findAll();
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
    _rpe: any,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Book[]> {
    return await ctx['books'].load(author.id);
  }
}
