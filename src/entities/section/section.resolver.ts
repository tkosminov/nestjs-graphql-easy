import { Args, Context, ID, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Section } from './section.entity';
import { SectionService } from './section.service';

import { ELoaderType, Loader } from '../../graphql/loaders/decorator.loader';
import { Book } from '../book/book.entity';

@Resolver(() => Section)
export class SectionResolver {
  constructor(private readonly sectionService: SectionService) {}

  @Query(() => [Section])
  public async sections() {
    return await this.sectionService.findAll();
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
    _rpe: any,
    @Context() ctx: any
  ): Promise<Book> {
    return await ctx['book'].load(section.book_id);
  }
}
