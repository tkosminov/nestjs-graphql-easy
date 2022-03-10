import { Args, Context, GraphQLExecutionContext, ID, Parent, Resolver } from '@nestjs/graphql';

import { Query, ResolveField } from '@gql/store';
import { ELoaderType, Loader } from '@gql/loaders/decorator.loader';
import { Filter } from '@gql/filters/decorator.filter';
import { Order } from '@gql/order/decorator.order';
import { Pagination } from '@gql/pagination/decorator.pagination';

import { Book } from '../book/book.entity';
import { Section } from './section.entity';
import { SectionService } from './section.service';

import { SectionTitle } from '../section_title/section_title.entity';

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

  @ResolveField(() => Book)
  public async book(
    @Parent() section: Section,
    @Loader({
      loader_type: ELoaderType.MANY_TO_ONE,
      field_name: 'book',
      relation_table: 'book',
      relation_fk: 'id',
    })
    field_alias: string,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Book> {
    return await ctx[field_alias].load(section.book_id);
  }

  @ResolveField(() => SectionTitle)
  public async section_title(
    @Parent() section: Section,
    @Loader({
      loader_type: ELoaderType.ONE_TO_ONE,
      field_name: 'section_title',
      relation_table: 'section_title',
      relation_fk: 'section_id',
    })
    field_alias: string,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Book> {
    return await ctx[field_alias].load(section.id);
  }
}
