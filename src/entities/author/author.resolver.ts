import { not_found } from '@errors';
import { Inject } from '@nestjs/common';
import { Args, Context, GraphQLExecutionContext, ID, Parent, Resolver, Subscription } from '@nestjs/graphql';

import { PubSub } from 'graphql-subscriptions';
import { Query, ResolveField, ELoaderType, Loader, Filter, Order, Pagination, Mutation } from 'nestjs-graphql-easy';
import { DataSource } from 'typeorm';

import { GRAPHQL_SUBSCRIPTIONS_PUB_SUB } from '../../graphql/graphql.module';
import { Book } from '../book/book.entity';
import { Author } from './author.entity';

@Resolver(() => Author)
export class AuthorResolver {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(GRAPHQL_SUBSCRIPTIONS_PUB_SUB) private readonly pubSub: PubSub
  ) {}

  @Query(() => [Author])
  public async authors(
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
  public async books(
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
  public async updateAuthor(@Args({ name: 'id', type: () => ID }) id: string, @Args({ name: 'name', type: () => String }) name: string) {
    const author = await this.dataSource.getRepository(Author).findOne({ where: { id } });

    if (author == null) {
      not_found({ raise: true });
    }

    author.name = name;

    await this.dataSource.getRepository(Author).update(author.id, { name: author.name });

    this.pubSub.publish('updateAuthorEvent', { updateAuthorEvent: author, channel_ids: [null, '1'] });

    return author;
  }

  @Subscription(() => Author, { filter: (payload, variables) => payload.channel_ids.includes(variables.channel_id) })
  protected async updateAuthorEvent(@Args({ name: 'channel_id', type: () => ID, nullable: true }) _channel_id: string) {
    return this.pubSub.asyncIterator('updateAuthorEvent');
  }
}
