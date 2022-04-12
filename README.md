# NestJS

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

# NestJS-GraphQL-Easy

## Installation

```bash
npm i nestjs-graphql-easy
```

## Usage

### Important!

1. The typeorm model and the graphql object must be the same class.
2. Decorators `PolymorphicColumn`, `Column`, `Entity`, `CreateDateColumn`, `UpdateDateColumn`, `PrimaryColumn`, `PrimaryGeneratedColumn` from `typeorm` must be imported from `nestjs-graphql-easy`
3. Decorators `Field` (only for columns from tables), `ObjectType`, `Query`, `Mutation`, `ResolveField` from `graphql` must be imported from `nestjs-graphql-easy`

* Points 2 and 3 are caused by the fact that it is necessary to collect data for auto-generation of filters and sorts, as well as not to deal with casting the names `graphql field <-> class property <-> typeorm column` and `graphql object <-> class name < -> typeorm table` (imported decorators from `nestjs-graphql-easy` removed the ability to set a name)

4. Decorators `Filter`, `Order` from `nestjs-graphql-easy` work only with loader types `ELoaderType.MANY` and `ELoaderType.ONE_TO_MANY`
5. Decorators `Pagination` from `nestjs-graphql-easy` work only with loader types `ELoaderType.MANY`

### Dependencies!

1. NestJS 8
2. TypeORM

### Entity/Object basic example

```ts
import { ID } from '@nestjs/graphql';

import { Index, OneToMany } from 'typeorm';
import {
  ObjectType,
  Field,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn
} from 'nestjs-graphql-easy';

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

### Resolver basic example

```ts
import { Args, Context, GraphQLExecutionContext, ID, Parent, Resolver } from '@nestjs/graphql';

import {
  Query,
  ResolveField,
  ELoaderType,
  Loader,
  Filter,
  Order,
  Pagination
} from 'nestjs-graphql-easy';

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
      entity: () => Author,
      entity_fk_key: 'id',
    }) field_alias: string,
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
      entity_joins: [
        {
          query: 'book.author',
          alias: 'author'
        }
      ],
      entity_wheres: [
        {
          query: 'book.is_private = :is_private',
          params: { is_private: false },
        },
        {
          query: 'author.id IS NOT NULL'
        }
      ],
    }) field_alias: string,
    @Filter(() => Book) _filter: unknown,
    @Order(() => Book) _order: unknown,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Book[]> {
    return await ctx[field_alias].load(author.id);
  }
}
```

### Query basic example

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

### Entity/Object with polymorphic relation example

```ts
import { ID } from '@nestjs/graphql';

import { Index, JoinColumn, ManyToOne } from 'typeorm';

import {
  Field,
  ObjectType,
  PolymorphicColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn
} from 'nestjs-graphql-easy';

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
  @PolymorphicColumn() // <-- add
  public itemable_id: string;

  @Field(() => String, { filterable: true, sortable: true })
  @Index()
  @Column({ nullable: false })
  @PolymorphicColumn() // <-- add
  public itemable_type: string;
}
```

### Polymorphic union type example

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

### Resolver with polymorphic relation example

```ts
import { Args, Context, GraphQLExecutionContext, ID, Parent, Resolver } from '@nestjs/graphql';

import {
  Query,
  ResolveField,
  ELoaderType,
  Loader,
  Filter,
  Order,
  Pagination
} from 'nestjs-graphql-easy';

import { Section } from '../section/section.entity';

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
      entity: () => Item,
      entity_fk_key: 'id',
    }) field_alias: string,
    @Filter(() => Item) _filter: unknown,
    @Order(() => Item) _order: unknown,
    @Pagination() _pagination: unknown,
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias];
  }

  @ResolveField(() => Section, { nullable: false })
  public async section(
    @Parent() item: Item,
    @Loader({
      loader_type: ELoaderType.MANY_TO_ONE,
      field_name: 'section',
      entity: () => Section,
      entity_fk_key: 'id',
    }) field_alias: string,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Section> {
    return await ctx[field_alias].load(item.section_id);
  }

  @ResolveField(() => ItemableType, { nullable: true })
  public async itemable(
    @Parent() item: Item,
    @Loader({
      loader_type: ELoaderType.POLYMORPHIC,
      field_name: 'itemable',
      entity: () => ItemableType,
      entity_fk_key: 'id',
      entity_fk_type: 'itemable_type',
    }) field_alias: string,
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias].load(item.itemable_id);
  }
}
```

### Query with polymorphic relation example

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
