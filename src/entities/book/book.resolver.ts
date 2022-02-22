import { Args, Context, GraphQLExecutionContext, ID, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { ELoaderType, Loader } from '../../graphql/loaders/decorator.loader';
import { Filter } from '../../graphql/filters/decorator.filter';
import { Order } from '../../graphql/order/decorator.order';
import { Pagination } from '../../graphql/pagination/decorator.parser';

import { Author } from '../author/author.entity';
import { Section } from '../section/section.entity';
import { Book } from './book.entity';
import { BookService } from './book.service';

@Resolver(() => Book)
export class BookResolver {
  constructor(private readonly bookService: BookService) {}

  @Query(() => [Book])
  public async books(
    @Loader({
      loader_type: ELoaderType.MANY,
      field_name: 'books',
      relation_table: 'book',
      relation_fk: 'id',
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
    @Pagination() _pagination: unknown,
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias];
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
      relation_fk: 'id',
    })
    field_alias: string,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Author> {
    return await ctx[field_alias].load(book.author_id);
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
    field_alias: string,
    @Filter({
      relation_table: 'section',
    })
    _filter: unknown,
    @Order({
      relation_table: 'section',
    })
    _order: unknown,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Section[]> {
    return await ctx[field_alias].load(book.id);
  }
}
