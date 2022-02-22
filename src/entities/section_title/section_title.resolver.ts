import { Context, GraphQLExecutionContext, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { ELoaderType, Loader } from '../../graphql/loaders/decorator.loader';
import { Filter } from '../../graphql/filters/decorator.filter';
import { Order } from '../../graphql/order/decorator.order';
import { Pagination } from '../../graphql/pagination/decorator.parser';

import { SectionTitle } from './section_title.entity';
import { SectionTitleService } from './section_title.service';

@Resolver(() => SectionTitle)
export class SectionTitleResolver {
  constructor(private readonly sectionTitleService: SectionTitleService) {}

  @Query(() => [SectionTitle])
  public async section_titles(
    @Loader({
      loader_type: ELoaderType.MANY,
      field_name: 'section_titles',
      relation_table: 'section_title',
      relation_fk: 'id',
    })
    field_alias: string,
    @Filter({
      relation_table: 'section_title',
    })
    _filter: unknown,
    @Order({
      relation_table: 'section_title',
    })
    _order: unknown,
    @Pagination() _pagination: unknown,
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias];
  }

  @ResolveField()
  public async section(
    @Parent() section_title: SectionTitle,
    @Loader({
      loader_type: ELoaderType.ONE_TO_ONE,
      field_name: 'section',
      relation_table: 'section',
      relation_fk: 'id',
    })
    field_alias: string,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<SectionTitle> {
    return await ctx[field_alias].load(section_title.section_id);
  }
}
