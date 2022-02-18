import { Args, Context, GraphQLExecutionContext, ID, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { ELoaderType, Loader } from '../../graphql/loaders/decorator.loader';
import { Filter } from '../../graphql/filters/decorator.filter';
import { Order } from '../../graphql/order/decorator.order';
import { Pagination } from '../../graphql/pagination/decorator.parser';

import { Book } from '../book/book.entity';
import { Section } from './section.entity';
import { SectionService } from './section.service';

@Resolver(() => Section)
export class SectionResolver {
  constructor(private readonly sectionService: SectionService) {}

  @Query(() => [Section])
  public async sections(
    @Loader({
      loader_type: ELoaderType.MANY,
      field_name: 'sections',
      relation_table: 'section',
      relation_fk: 'id',
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
    @Pagination() _pagination: unknown,
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias];
  }

  @Query(() => Section)
  public async section(@Args({ name: 'id', type: () => ID }) id: string) {
    return await this.sectionService.findOne(id);
  }

  @ResolveField()
  public async book(
    @Parent() section: Section,
    @Loader({
      loader_type: ELoaderType.MANY_TO_ONE,
      field_name: 'book',
      relation_table: 'book',
      relation_fk: 'book_id',
    })
    field_alias: string,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Book> {
    return await ctx[field_alias].load(section.book_id);
  }
}
