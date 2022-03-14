import { Context, GraphQLExecutionContext, Parent, Resolver } from '@nestjs/graphql';

import { Query, ResolveField } from '@gql/store';
import { ELoaderType, Loader } from '@gql/loader/decorator.loader';
import { Filter } from '@gql/filter/decorator.filter';
import { Order } from '@gql/order/decorator.order';
import { Pagination } from '@gql/pagination/decorator.pagination';

import { SectionTitle } from './section_title.entity';
import { SectionTitleService } from './section_title.service';

import { Section } from '../section/section.entity';

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

  @ResolveField(() => Section, { nullable: false })
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
