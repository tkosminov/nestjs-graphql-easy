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

import { ELoaderType, Loader } from '../../graphql/loaders/decorator.loader';
import { Book } from '../book/book.entity';

@Resolver(() => Author)
export class AuthorResolver {
  constructor(private readonly authorService: AuthorService) {}

  @Query(() => [Author])
  public async authors() {
    return await this.authorService.findAll();
  }

  @Query(() => Author)
  public async author(@Args({ name: 'id', type: () => ID }) id: string) {
    return await this.authorService.findOne(id);
  }

  @ResolveField()
  public async books(
    @Parent() author: Author,
    @Loader({
      loader_type: ELoaderType.ONE_TO_MANY,
      field_name: 'books',
      relation_table: 'book',
      relation_fk: 'author_id'
    }) _rpe: any,
    @Context() ctx: any,
  ): Promise<Book[]> {
    return await ctx['books'].load(author.id);
  }
}
