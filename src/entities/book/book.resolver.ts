import {
  Args,
  Context,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { Book } from './book.entity';
import { BookService } from './book.service';

import { Loader } from '../../graphql/loaders/decorator.loader';
import { Author } from '../author/author.entity';
import { Section } from '../section/section.entity';

@Resolver(() => Book)
export class BookResolver {
  constructor(private readonly bookService: BookService) {}

  @Query(() => [Book])
  public async books(@Loader(Book) loader: any) {
    return await loader;
  }

  @Query(() => Book)
  public async book(@Args({ name: 'id', type: () => ID }) id: string) {
    return await this.bookService.findOne(id);
  }

  @ResolveField()
  public async author(
    @Parent() book: Book,
    @Loader('author') _rpe: any,
    @Context() ctx: any,
  ): Promise<Author> {
    return await ctx['author'].load(book.author_id);
  }

  @ResolveField()
  public async sections(
    @Parent() book: Book,
    @Loader(['sections', 'book_id']) _rpe: any,
    @Context() ctx: any,
  ): Promise<Section[]> {
    return await ctx['sections'].load(book.id);
  }
}
