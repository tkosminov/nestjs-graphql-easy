import { Args, Context, GraphQLExecutionContext, ID, Parent, Resolver } from '@nestjs/graphql';

import { Query, ResolveField, ELoaderType, Loader, Filter, Order, Pagination } from '@gql';

import { Book } from '../book/book.entity';
import { Item } from './item.entity';
import { ItemService } from './item.service';
import { ItemableType } from './item.itemable';

@Resolver(() => Item)
export class ItemResolver {
  constructor(private readonly itemService: ItemService) {}

  @Query(() => [Item])
  public async items(
    @Loader({
      loader_type: ELoaderType.MANY,
      field_name: 'items',
      relation_table: 'item',
      relation_fk: 'id',
    })
    field_alias: string,
    @Filter({
      relation_table: 'item',
    })
    _filter: unknown,
    @Order({
      relation_table: 'item',
    })
    _order: unknown,
    @Pagination() _pagination: unknown,
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias];
  }

  @Query(() => Item)
  public async item(@Args({ name: 'id', type: () => ID }) id: string) {
    return await this.itemService.findOne(id);
  }

  @ResolveField(() => Book, { nullable: false })
  public async section(
    @Parent() item: Item,
    @Loader({
      loader_type: ELoaderType.MANY_TO_ONE,
      field_name: 'section',
      relation_table: 'section',
      relation_fk: 'id',
    })
    field_alias: string,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Book> {
    return await ctx[field_alias].load(item.section_id);
  }

  @ResolveField(() => ItemableType, { nullable: true })
  public async itemable(
    @Parent() item: Item,
    @Loader({
      loader_type: ELoaderType.POLYMORPHIC,
      field_name: 'itemable',
      // relation_table: 'section',
      relation_fk: 'id',
    })
    field_alias: string,
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias].load(item.itemable_id);
  }
}
