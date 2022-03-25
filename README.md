# NestJS

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

# NestJS-GraphQL-Example

## Inspired

* https://github.com/sulthanmamusa/graphql-dataloader
* https://github.com/Mando75/typeorm-graphql-loader
* https://github.com/slaypni/type-graphql-dataloader

## Installation

### Dependencies

* PostgreSQL 13+
* NodeJS 14+

### Installation

```bash
npm ci
```

### DB Settings

sudo -i -u postgres

createdb ${env}_nestjs_graphql_template

## GraphQL

### Basic Example

#### Entity

```ts
import { ID } from '@nestjs/graphql';

import { Index, OneToMany } from 'typeorm';

import { ObjectType, Field, Column, Entity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from '@gql';

import { Book } from '../book/book.entity';

@ObjectType()
@Entity()
export class Author {
  @Field(() => ID, { filterable: true, sortable: true })
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Field(() => Date)
  @CreateDateColumn({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public created_at: Date;

  @Field(() => Date)
  @UpdateDateColumn({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public updated_at: Date;

  @Field(() => String, { filterable: true, sortable: true })
  @Column()
  @Index({ unique: true })
  public name: string;

  @OneToMany(() => Book, (book) => book.author, { onDelete: 'CASCADE' })
  public books: Book[];
}
```

#### Resolver

```ts
import { Args, Context, GraphQLExecutionContext, ID, Parent, Resolver } from '@nestjs/graphql';

import { Query, ResolveField, ELoaderType, Loader, Filter, Order, Pagination } from '@gql';

import { Book } from '../book/book.entity';
import { Author } from './author.entity';
import { AuthorService } from './author.service';

@Resolver(() => Author)
export class AuthorResolver {
  constructor(private readonly authorService: AuthorService) {}

  @Query(() => [Author])
  public async authors(
    @Loader({
      loader_type: ELoaderType.MANY,
      field_name: 'authors',
      entity: Author,
      entity_fk_key: 'id',
    })
    field_alias: string,
    @Filter(Author) _filter: unknown,
    @Order(Author) _order: unknown,
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
      entity: Book,
      entity_fk_key: 'author_id',
      entity_where: {
        query: 'book.is_private = :is_private',
        params: { is_private: false },
      },
    })
    field_alias: string,
    @Filter(Book) _filter: unknown,
    @Order(Book) _order: unknown,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Book[]> {
    return await ctx[field_alias].load(author.id);
  }
```

#### Query

```graphql
query {
  authors(
    WHERE: { id: { NULL: false }, name: { ILIKE: "Author" } }
    ORDER: { id: { SORT: ASC } }
    PAGINATION: { page: 0, per_page: 10 }
  ) {
    id
    name
    books(ORDER: { created_at: { SORT: DESC } }) {
      id
      title
    }
  }
}
```

### Polymorphic Example

#### Entity

```ts
import { ID } from '@nestjs/graphql';

import { Index, JoinColumn, ManyToOne } from 'typeorm';

import { Field, ObjectType, PolymorphicColumn, Column, Entity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from '@gql';

import { Section } from '../section/section.entity';

@ObjectType()
@Entity()
export class Item {
  @Field(() => ID, { filterable: true, sortable: true })
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Field(() => Date)
  @CreateDateColumn({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public created_at: Date;

  @Field(() => Date)
  @UpdateDateColumn({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public updated_at: Date;

  @Field(() => ID, { filterable: true, sortable: true })
  @Index()
  @Column('uuid', { nullable: false })
  public section_id: string;

  @ManyToOne(() => Section, { nullable: false })
  @JoinColumn({ name: 'section_id' })
  public section: Section;

  @Field(() => ID, { filterable: true, sortable: true })
  @Index()
  @Column('uuid', { nullable: false })
  @PolymorphicColumn()
  public itemable_id: string;

  @Field(() => String, { filterable: true, sortable: true })
  @Index()
  @Column({ nullable: false })
  @PolymorphicColumn()
  public itemable_type: string;
}
```

#### Union Type

```ts
import { createUnionType } from '@nestjs/graphql';

import { ItemImage } from '../item-image/item-image.entity';
import { ItemText } from '../item-text/item-text.entity';

export const ItemableType = createUnionType({
  name: 'ItemableType',
  types: () => [ItemText, ItemImage],
  resolveType(value) {
    if (value instanceof ItemText) {
      return ItemText;
    } else if (value instanceof ItemImage) {
      return ItemImage;
    }
  },
});
```

#### Resolver

```ts
import { Context, GraphQLExecutionContext, ID, Parent, Resolver } from '@nestjs/graphql';

import { Query, ResolveField, ELoaderType, Loader, Filter, Order, Pagination } from '@gql';

import { ItemText } from '../item-text/item-text.entity';
import { ItemImage } from '../item-image/item-image.entity';

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
      entity: Item,
      entity_fk_key: 'id',
    })
    field_alias: string,
    @Filter(Item)
    _filter: unknown,
    @Order(Item)
    _order: unknown,
    @Pagination() _pagination: unknown,
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias];
  }

  @ResolveField(() => ItemableType, { nullable: true })
  public async itemable(
    @Parent() item: Item,
    @Loader({
      loader_type: ELoaderType.POLYMORPHIC,
      field_name: 'itemable',
      entity: ItemText || ItemImage,
      entity_fk_key: 'id',
      entity_fk_type: 'itemable_type',
    })
    field_alias: string,
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias].load(item.itemable_id);
  }
}
```

#### Query

```graphql
query {
  items(
    WHERE: { id: { NULL: false } }
    ORDER: { id: { SORT: ASC } }
    PAGINATION: { page: 0, per_page: 10 }
  ) {
    id
    itemable_id
    itemable_type
    itemable {
      __typename
      ... on ItemText {
        id
        value
      }
      ... on ItemImage {
        id
        file_url
        created_at
      }
    }
  }
}
```