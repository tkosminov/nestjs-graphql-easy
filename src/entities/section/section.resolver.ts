import { Args, Context, GraphQLExecutionContext, ID, Parent, Resolver } from '@nestjs/graphql';

import { Query, ResolveField, ELoaderType, Loader, Filter, Order, Pagination } from '@gql';

import { Book } from '../book/book.entity';
import { Section } from './section.entity';
import { SectionService } from './section.service';

import { SectionTitle } from '../section-title/section-title.entity';
import { Item } from '../item/item.entity';

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

  @ResolveField(() => Book, { nullable: false })
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

  @ResolveField(() => SectionTitle, { nullable: true })
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

  @ResolveField(() => [Item], { nullable: true })
  public async items(
    @Parent() section: Section,
    @Loader({
      loader_type: ELoaderType.ONE_TO_MANY,
      field_name: 'items',
      relation_table: 'item',
      relation_fk: 'section_id',
    })
    field_alias: string,
    @Filter({
      relation_table: 'item',
    })
    _filter: unknown,
    @Order({
      relation_table: 'item',
    })
    _order: unknown,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Section[]> {
    return await ctx[field_alias].load(section.id);
  }
}
