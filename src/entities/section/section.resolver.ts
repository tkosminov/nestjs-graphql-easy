import {
  Args,
  Context,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { Section } from './section.entity';
import { SectionService } from './section.service';

import { Loader } from '../../graphql/loaders/decorator.loader';
import { Book } from '../book/book.entity';

@Resolver(() => Section)
export class SectionResolver {
  constructor(private readonly sectionService: SectionService) {}

  @Query(() => [Section])
  public async sections(@Loader(Section) loader: any) {
    return await loader;
  }

  @Query(() => Section)
  public async section(@Args({ name: 'id', type: () => ID }) id: string) {
    return await this.sectionService.findOne(id);
  }

  @ResolveField()
  public async book(
    @Parent() section: Section,
    @Loader('book') _rpe: any,
    @Context() ctx: any,
  ): Promise<Book> {
    return await ctx['book'].load(section.book_id);
  }
}
