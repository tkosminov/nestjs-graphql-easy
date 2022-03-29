import { Context, GraphQLExecutionContext, Parent, Resolver } from '@nestjs/graphql';

import { Query, ResolveField, ELoaderType, Loader, Filter, Order, Pagination } from 'nestjs-graphql-easy';

import { SectionTitle } from './section-title.entity';
import { SectionTitleService } from './section-title.service';

import { Section } from '../section/section.entity';

@Resolver(() => SectionTitle)
export class SectionTitleResolver {
  constructor(private readonly sectionTitleService: SectionTitleService) {}

  @Query(() => [SectionTitle])
  public async section_titles(
    @Loader({
      loader_type: ELoaderType.MANY,
      field_name: 'section_titles',
      entity: SectionTitle,
      entity_fk_key: 'id',
    })
    field_alias: string,
    @Filter(SectionTitle) _filter: unknown,
    @Order(SectionTitle) _order: unknown,
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
      entity: Section,
      entity_fk_key: 'id',
    })
    field_alias: string,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<SectionTitle> {
    return await ctx[field_alias].load(section_title.section_id);
  }
}
