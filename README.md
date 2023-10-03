# NestJS-GraphQL-Easy

<p align="center">
  <a href="https://www.npmjs.com/package/nestjs-graphql-easy" target="_blank"><img src="https://img.shields.io/npm/v/nestjs-graphql-easy.svg" alt="NPM Version"></a>
  <a href="https://www.npmjs.com/package/nestjs-graphql-easy" target="_blank"><img src="https://img.shields.io/npm/l/nestjs-graphql-easy.svg" alt="Package License"></a>
  <a href="https://www.npmjs.com/package/nestjs-graphql-easy" target="_blank"><img src="https://img.shields.io/npm/dm/nestjs-graphql-easy.svg" alt="NPM Downloads"></a>
</p>

## Overview

- [NestJS-GraphQL-Easy](#nestjs-graphql-easy)
  - [Overview](#overview)
  - [Description](#description)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Note](#note)
  - [Important!](#important)
  - [Datasource](#datasource)
  - [Dataloader (n + 1 problem solver)](#dataloader-n--1-problem-solver)
    - [many](#many)
    - [one-to-many](#one-to-many)
    - [many-to-one](#many-to-one)
    - [one-to-one](#one-to-one)
    - [polymorphic](#polymorphic)
  - [Filtering](#filtering)
  - [Ordering](#ordering)
  - [Pagination](#pagination)
  - [Cursor pagination](#cursor-pagination)
  - [Permanent filters](#permanent-filters)

## Description

A library for NestJS that implements a dataloader (including for polymorphic relation) for graphql, as well as automatic generation of arguments for filters, sorting and pagination, and their processing in the dataloader.

## Introduction

With this library you will be able to easily create complex queries

```gql
{
  authors(
    ORDER: { name: { SORT: ASC } }
    PAGINATION: { page: 0, per_page: 10 }
  ) {
    id
    name
    gender
    books(
      WHERE: { is_private: { EQ: false } }
      ORDER: { created_at: { SORT: DESC } }
    ) {
      id
      author_id
      title
      created_at
    }
  }
}
```

## Installation

```bash
npm i nestjs-graphql-easy
```

## Note

**This library requires**:
* NestJS 9 or higher version
* TypeORM 0.3 or higher version

**A fully working example with all the functionality is located in the `src` folder**

**The library itself is located in the `lib` folder**

`If you have questions or need help, please create GitHub Issue in this repository `[https://github.com/tkosminov/nestjs-graphql-easy](https://github.com/tkosminov/nestjs-graphql-easy)

## Important!

1. The typeorm model and the graphql object must be the same class.
2. Decorators `PolymorphicColumn`, `Column`, `Entity`, `CreateDateColumn`, `UpdateDateColumn`, `PrimaryColumn`, `PrimaryGeneratedColumn` from `typeorm` must be imported from `nestjs-graphql-easy`
3. Decorators `Field` (only for columns from tables), `ObjectType`, `Query`, `Mutation`, `ResolveField` from `graphql` must be imported from `nestjs-graphql-easy`

* Points 2 and 3 are caused by the fact that it is necessary to collect data for auto-generation of filters and sorts, as well as not to deal with casting the names `graphql field <-> class property <-> typeorm column` and `graphql object <-> class name < -> typeorm table` (imported decorators from `nestjs-graphql-easy` removed the ability to set a name)

4. Decorators `Filter`, `Order` from `nestjs-graphql-easy` work only with loader types `ELoaderType.MANY` and `ELoaderType.ONE_TO_MANY`
5. Decorators `Pagination` from `nestjs-graphql-easy` work only with loader types `ELoaderType.MANY`

## Datasource

Need to pass `DataSource` to `GraphQLExecutionContext`.

I do this by creating a `GraphQLModule` using a class

```ts
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';

import { GraphqlOptions } from './graphql.options';

export default GraphQLModule.forRootAsync({
  imports: [],
  useClass: GraphqlOptions, // <-- ADD
  inject: [],
  driver: ApolloDriver,
});
```

```ts
import { Injectable } from '@nestjs/common';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
...
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { setDataSource } from 'nestjs-graphql-easy' // <-- ADD

@Injectable()
export class GraphqlOptions implements GqlOptionsFactory {
  constructor(private readonly dataSource: DataSource) { // <-- ADD
    setDataSource(this.dataSource); // <-- ADD
  }

  public createGqlOptions(): Promise<ApolloDriverConfig> | ApolloDriverConfig {
    return {
      ...
      driver: ApolloDriver,
      context: ({ req }: { req: Request }) => ({
        req,
      }),
      ...
    };
  }
}
```

## Dataloader (n + 1 problem solver)

Loader usage guide:

1. Add the `@Loader` parameter
   1. Specify the type of relationship `loader_type`
   2. Specify field name `field_name`
   3. Specify entity `@Entity()` that is also an `@ObjectType()` using the return type function
   4. Specify the name of the key in the entity for which the selection should be
2. Add the `@Context` parameter
3. In the body of the resolver, use the loader by passing the value of the key to fetch into it

### many

```ts
@Resolver(() => Author)
export class AuthorResolver {
  ...
  @Query(() => [Author])
  public async authors(
    @Loader({ // <-- ADD
      loader_type: ELoaderType.MANY, 
      field_name: 'authors',
      entity: () => Author,
      entity_fk_key: 'id',
    }) field_alias: string,
    @Context() ctx: GraphQLExecutionContext // <-- ADD
  ) {
    return await ctx[field_alias]; // <-- ADD
  }
  ...
}
```

### one-to-many

```ts
@Resolver(() => Author)
export class AuthorResolver {
  ...
  @ResolveField(() => [Book], { nullable: true })
  public async books(
    @Parent() author: Author, // <-- ADD
    @Loader({ // <-- ADD
      loader_type: ELoaderType.ONE_TO_MANY,
      field_name: 'books',
      entity: () => Book,
      entity_fk_key: 'author_id',
    })
    field_alias: string,
    @Context() ctx: GraphQLExecutionContext // <-- ADD
  ): Promise<Book[]> {
    return await ctx[field_alias].load(author.id); // <-- ADD
  }
  ...
}
```

### many-to-one

```ts
@Resolver(() => Book)
export class BookResolver {
  ...
  @ResolveField(() => Author, { nullable: false })
  public async author(
    @Parent() book: Book, // <-- ADD
    @Loader({ // <-- ADD
      loader_type: ELoaderType.MANY_TO_ONE,
      field_name: 'author',
      entity: () => Author,
      entity_fk_key: 'id',
    })
    field_alias: string,
    @Context() ctx: GraphQLExecutionContext // <-- ADD
  ): Promise<Author> {
    return await ctx[field_alias].load(book.author_id); // <-- ADD
  }
  ...
}
```

### one-to-one

```ts
@Resolver(() => Section)
export class SectionResolver {
  ...
  @ResolveField(() => SectionTitle, { nullable: true })
  public async section_title(
    @Parent() section: Section, // <-- ADD
    @Loader({ // <-- ADD
      loader_type: ELoaderType.ONE_TO_ONE,
      field_name: 'section_title',
      entity: () => SectionTitle,
      entity_fk_key: 'section_id',
    })
    field_alias: string,
    @Context() ctx: GraphQLExecutionContext // <-- ADD
  ): Promise<Book> {
    return await ctx[field_alias].load(section.id); // <-- ADD
  }
  ...
}

@Resolver(() => SectionTitle)
export class SectionTitleResolver {
  ...
  @ResolveField(() => Section, { nullable: false })
  public async section(
    @Parent() section_title: SectionTitle, // <-- ADD
    @Loader({ // <-- ADD
      loader_type: ELoaderType.ONE_TO_ONE,
      field_name: 'section',
      entity: () => Section,
      entity_fk_key: 'id',
    })
    field_alias: string,
    @Context() ctx: GraphQLExecutionContext // <-- ADD
  ): Promise<SectionTitle> {
    return await ctx[field_alias].load(section_title.section_id); // <-- ADD
  }
  ...
}
```

### polymorphic

For a polymorphic relationship, you need to create a `UnionType`:

```ts
export const ItemableType = createUnionType({ // <-- ADD
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

In the model entity, add two columns to indicate the foreign key and the name of the foreign model:

```ts
@ObjectType()
@Entity()
export class Item {
  ...
  /**
   * For a polymorphic relationship, the relationship in the Entity is not specified.
   * But you need to create columns for foreign key and table type.
   */

  @Field(() => ID)
  @Index()
  @Column('uuid', { nullable: false })
  @PolymorphicColumn() // <-- ADD
  public itemable_id: string; // foreign key

  @Field(() => String)
  @Index()
  @Column({ nullable: false })
  @PolymorphicColumn() // <-- ADD
  public itemable_type: string; // foreign type
  ...
}
```

```ts
@Resolver(() => Item)
export class ItemResolver {
  ...
  @ResolveField(() => ItemableType, { nullable: true })
  public async itemable(
    @Parent() item: Item,
    @Loader({
      loader_type: ELoaderType.POLYMORPHIC,
      field_name: 'itemable',
      entity: () => ItemableType, // For a polymorphic relation, it is necessary to specify here not the Entity, but the Union type.
      entity_fk_key: 'id',
      entity_fk_type: 'itemable_type',
    }) field_alias: string,
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias].load(item.itemable_id);
  }
  ...
}
```

Polymorphic query example:

```gql
{
  items {
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

## Filtering

Filters work in tandem with the dataloader and make it possible to filter entities by conditions:

```ts
export enum EFilterOperation {
  EQ = '=',
  NOT_EQ = '!=',
  NULL = 'IS NULL',
  NOT_NULL = 'IS NOT NULL',
  IN = 'IN',
  NOT_IN = 'NOT IN',
  ILIKE = 'ILIKE',
  NOT_ILIKE = 'NOT ILIKE',
  GT = '>',
  GTE = '>=',
  LT = '<',
  LTE = '<=',
}
```

Filters are generated based on the information specified in the `@Field` provided in the model:

```ts
@ObjectType()
@Entity()
export class Author {
  @Field(() => ID, { filterable: true }) // <-- ADD
  @PrimaryGeneratedColumn('uuid')
  public id: string;
  ...
}
```

```ts
@Resolver(() => Author)
export class AuthorResolver {
  ...
  @Query(() => [Author])
  public async authors(
    @Loader({
      loader_type: ELoaderType.MANY, 
      field_name: 'authors',
      entity: () => Author,
      entity_fk_key: 'id',
    }) field_alias: string,
    @Filter(() => Author) _filter: unknown, // <-- ADD
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias];
  }
  ...
}
```

This will add arguments to the query for filtering:

```gql
{
  authors(WHERE: { id: { EQ: 1 } }) {
    id
    name
  }
}
```

When working with filters, it is important to remember [point 4 of the important section](#important).

## Ordering

Ordering works in tandem with the data loader and allows you to sort entities. Arguments for the query are created based on the information provided in the model in `@Field`

```ts
@ObjectType()
@Entity()
export class Author {
  @Field(() => ID, { sortable: true }) // <-- ADD
  @PrimaryGeneratedColumn('uuid')
  public id: string;
  ...
}
```

```ts
@Resolver(() => Author)
export class AuthorResolver {
  ...
  @Query(() => [Author])
  public async authors(
    @Loader({
      loader_type: ELoaderType.MANY, 
      field_name: 'authors',
      entity: () => Author,
      entity_fk_key: 'id',
    }) field_alias: string,
    @Order(() => Author) _order: unknown, // <-- ADD
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias];
  }
  ...
}
```

This will add arguments to the query for ordering:

```gql
{
  authors(ORDER: { id: { SORT: ASC, NULLS: LAST } }) {
    id
    name
  }
}
```

When working with ordering, it is important to remember [point 4 of the important section](#important).

## Pagination

Pagination works in tandem with a dataloader and allows you to limit the number of records received from the database

```ts
@Resolver(() => Author)
export class AuthorResolver {
  ...
  @Query(() => [Author])
  public async authors(
    @Loader({
      loader_type: ELoaderType.MANY, 
      field_name: 'authors',
      entity: () => Author,
      entity_fk_key: 'id',
    }) field_alias: string,
    @Pagination() _pagination: unknown, // <-- ADD
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias];
  }
  ...
}
```

This will add arguments to the query for pagination:

```gql
{
  authors(PAGINATION: { page: 0, per_page: 10 }) {
    id
    name
  }
}
```

When working with pagination, it is important to remember [point 5 of the important section](#important).

## [Cursor pagination](https://the-guild.dev/blog/graphql-cursor-pagination-with-postgresql)

Pagination works in tandem with a data loader, filters, and sorting and allows you to limit the number of records received from the database

```ts
@Resolver(() => Author)
export class AuthorResolver {
  ...
  @Query(() => [Author])
  public async authors(
    @Loader({
      loader_type: ELoaderType.MANY, 
      field_name: 'authors',
      entity: () => Author,
      entity_fk_key: 'id',
    }) field_alias: string,
    @Filter(() => Author) _filter: unknown, // <-- ADD
    @Order(() => Author) _order: unknown, // <-- ADD
    @Pagination() _pagination: unknown, // <-- ADD
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias];
  }
  ...
}
```

Then you can get the first page using the query:

```gql
query firstPage {
  authors(
    ORDER: { id: { SORT: ASC } }
    PAGINATION: { per_page: 10 }
  ) {
    id
  }
}
```

Then you can get the next page using the query:

```gql
query nextPage($ID_of_the_last_element_from_the_previous_page: ID!) {
  authors(
    WHERE: { id: { GT: $ID_of_the_last_element_from_the_previous_page }}
    ORDER: { id: { SORT: ASC } }
    PAGINATION: { per_page: 10 }
  ) {
    id
  }
}
```

Fields that are planned to be used as a cursor must be allowed for filtering and sorting in the `@Field` decorator, and it is also recommended to index them indicating the sort order.

With such pagination, it is important to take into account the order in which the fields specified in the sorting are listed.

You can also use several fields as cursors. The main thing is to maintain order.

Then you can get the first page using the query:

```gql
query firstPage{
  authors(
    ORDER: { updated_at: { SORT: DESC }, id: { SORT: ASC } }
    PAGINATION: { per_page: 10 }
  ) {
    id
  }
}

```

Then you can get the next page using the query:

```gql
query nextPage(
  $UPDATED_AT_of_the_last_element_from_the_previous_page: DateTime!
  $ID_of_the_last_element_from_the_previous_page: ID!
) {
  authors(
    WHERE: {
      updated_at: { LT: $UPDATED_AT_of_the_last_element_from_the_previous_page }
      OR: {
        updated_at: {
          EQ: $UPDATED_AT_of_the_last_element_from_the_previous_page
        }
        id: { GT: $ID_of_the_last_element_from_the_previous_page }
      }
    }
    ORDER: { updated_at: { SORT: DESC }, id: { SORT: ASC } }
    PAGINATION: { per_page: 10 }
  ) {
    id
  }
}
```

However, it is recommended to limit the time columns to milliseconds:

```ts
@ObjectType()
@Entity()
export class Author {
  ...
  @Field(() => Date, { filterable: true, sortable: true })
  @UpdateDateColumn({
    type: 'timestamp without time zone',
    precision: 3, // <-- ADD
    default: () => 'CURRENT_TIMESTAMP',
  })
  public updated_at: Date;
  ...
}
```

## Permanent filters

You can also specify permanent filters that will always be applied regardless of the query

To do this, you need to pass `entity_wheres` to the data loader:

```ts
@Resolver(() => Author)
export class AuthorResolver {
@ResolveField(() => [Book], { nullable: true })
  ...
  public async books(
    @Parent() author: Author,
    @Loader({
      loader_type: ELoaderType.ONE_TO_MANY,
      field_name: 'books',
      entity: () => Book,
      entity_fk_key: 'author_id',
      entity_wheres: [ // <-- ADD
        {
          query: 'book.is_private = :is_private',
          params: { is_private: false },
        },
      ],
    })
    field_alias: string,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Book[]> {
    return await ctx[field_alias].load(author.id);
  }
  ...
}
```

Such a filter can use the columns of entities joined via `entity_joins`:

```ts
@Resolver(() => Author)
export class AuthorResolver {
@ResolveField(() => [Book], { nullable: true })
  ...
  public async books(
    @Parent() author: Author,
    @Loader({
      loader_type: ELoaderType.ONE_TO_MANY,
      field_name: 'books',
      entity: () => Book,
      entity_fk_key: 'author_id',
      entity_wheres: [ // <-- ADD
        {
          query: 'book.is_private = :is_private',
          params: { is_private: false },
        },
        { // <-- ADD
          query: 'sections.title IS NOT NULL',
        },
      ],
      entity_joins: [ // <-- ADD
        {
          query: 'book.sections',
          alias: 'sections',
        },
      ],
    })
    field_alias: string,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Book[]> {
    return await ctx[field_alias].load(author.id);
  }
  ...
}
```
