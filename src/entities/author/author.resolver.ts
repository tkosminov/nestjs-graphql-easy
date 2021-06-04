import {
  Args,
  Context,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { Author } from './author.entity';
import { AuthorService } from './author.service';

import { Loader } from '../../graphql/loaders/decorator.loader';
import { Book } from '../book/book.entity';

@Resolver(() => Author)
export class AuthorResolver {
  constructor(private readonly authorService: AuthorService) {}

  @Query(() => [Author])
  public async authors(@Loader(Author) loader: any) {
    return await loader;
  }

  @Query(() => Author)
  public async author(@Args({ name: 'id', type: () => ID }) id: string) {
    return await this.authorService.findOne(id);
  }

  @ResolveField()
  public async books(
    @Parent() author: Author,
    @Loader(['books', 'author_id']) _rpe: any,
    @Context() ctx: any,
  ): Promise<Book[]> {
    return await ctx['books'].load(author.id);
  }
}
