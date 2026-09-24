import { Args, Context, type GraphQLExecutionContext, ID, Parent, Resolver, Subscription } from '@nestjs/graphql';

import { Query, ResolveField, Loader, ELoaderType, Filter, Order, Pagination, Mutation } from 'nestjs-graphql-easy';
import { PubSub } from 'graphql-subscriptions';
import { DataSource } from 'typeorm';

import { Author } from './author.entity.js';
import { Book } from '../book/book.entity.js';

@Resolver(() => Author)
export class AuthorResolver {
  constructor(
    private readonly data_source: DataSource,
    private readonly pub_sub: PubSub
  ) {}

  @Query(() => [Author], { nullable: false })
  protected async authors(
    @Loader({
      loader_type: ELoaderType.MANY,
      field_name: 'authors',
      entity: () => Author,
      entity_fk_key: 'id',
    })
    field_alias: string,
    @Filter(() => Author) _filter: unknown,
    @Order(() => Author) _order: unknown,
    @Pagination() _pagination: unknown,
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias];
  }

  @ResolveField(() => [Book], { nullable: true })
  protected async books(
    @Parent() author: Author,
    @Loader({
      loader_type: ELoaderType.ONE_TO_MANY,
      field_name: 'books',
      entity: () => Book,
      entity_fk_key: 'author_id',
      entity_wheres: [
        {
          query: 'book.is_private = :is_private',
          params: { is_private: false },
        },
      ],
    })
    field_alias: string,
    @Filter(() => Book) _filter: unknown,
    @Order(() => Book) _order: unknown,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Book[]> {
    return await ctx[field_alias].load(author.id);
  }

  @Mutation(() => Author)
  protected async authorNameUpdate(
    @Args({ name: 'id', type: () => ID, nullable: false }) id: string,
    @Args({ name: 'name', type: () => String, nullable: false }) name: string
  ) {
    const author = await this.data_source.getRepository(Author).findOneOrFail({ where: { id } });

    await this.data_source.getRepository(Author).update(author.id, { name });

    author.name = name;

    this.pub_sub.publish('authorNameUpdatedEvent', { authorNameUpdatedEvent: author });

    return author;
  }

  @Subscription(() => Author)
  protected async authorNameUpdatedEvent() {
    return this.pub_sub.asyncIterableIterator('authorNameUpdatedEvent');
  }
}
