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
      entity: Section,
      entity_fk_key: 'id',
    })
    field_alias: string,
    @Filter(Section) _filter: unknown,
    @Order(Section) _order: unknown,
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
      entity: Book,
      entity_fk_key: 'id',
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
      entity: SectionTitle,
      entity_fk_key: 'section_id',
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
      entity: Item,
      entity_fk_key: 'section_id',
    })
    field_alias: string,
    @Filter(Item) _filter: unknown,
    @Order(Item) _order: unknown,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Section[]> {
    return await ctx[field_alias].load(section.id);
  }
}
