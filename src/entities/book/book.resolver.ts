import { Args, Context, GraphQLExecutionContext, ID, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Book } from './book.entity';
import { BookService } from './book.service';

import { ELoaderType, Loader } from '../../graphql/loaders/decorator.loader';
import { Author } from '../author/author.entity';
import { Section } from '../section/section.entity';

@Resolver(() => Book)
export class BookResolver {
  constructor(private readonly bookService: BookService) {}

  @Query(() => [Book])
  public async books() {
    return await this.bookService.findAll();
  }

  @Query(() => Book)
  public async book(@Args({ name: 'id', type: () => ID }) id: string) {
    return await this.bookService.findOne(id);
  }

  @ResolveField()
  public async author(
    @Parent() book: Book,
    @Loader({
      loader_type: ELoaderType.MANY_TO_ONE,
      field_name: 'author',
      relation_table: 'author',
      relation_fk: 'author_id',
    })
    _rpe: GraphQLExecutionContext,
    @Context() ctx: any
  ): Promise<Author> {
    return await ctx['author'].load(book.author_id);
  }

  @ResolveField()
  public async sections(
    @Parent() book: Book,
    @Loader({
      loader_type: ELoaderType.ONE_TO_MANY,
      field_name: 'sections',
      relation_table: 'section',
      relation_fk: 'book_id',
    })
    _rpe: any,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Section[]> {
    return await ctx['sections'].load(book.id);
  }
}
