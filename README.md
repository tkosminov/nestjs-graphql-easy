# NestJS-GraphQL-Easy

## Installation

```bash
npm i nestjs-graphql-easy
```

## Fully working example with all types dataloader

[https://github.com/TimurRK/nestjs-graphql-easy](https://github.com/TimurRK/nestjs-graphql-easy)

`If you have questions or need help, please create GitHub Issue in this repository`

## Dependencies!

1. NestJS 9
2. TypeORM 0.3

## Usage

### DataSource

Need to pass `DataSource` to `GraphQLExecutionContext`

#### GraphQLModule

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

#### GraphqlOptions

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
        data_source: this.dataSource, // <-- DEPRECATED. But this will still work if no subscriptions are used
      }),
      ...
    };
  }
}
```

### Important!

1. The typeorm model and the graphql object must be the same class.
2. Decorators `PolymorphicColumn`, `Column`, `Entity`, `CreateDateColumn`, `UpdateDateColumn`, `PrimaryColumn`, `PrimaryGeneratedColumn` from `typeorm` must be imported from `nestjs-graphql-easy`
3. Decorators `Field` (only for columns from tables), `ObjectType`, `Query`, `Mutation`, `ResolveField` from `graphql` must be imported from `nestjs-graphql-easy`

* Points 2 and 3 are caused by the fact that it is necessary to collect data for auto-generation of filters and sorts, as well as not to deal with casting the names `graphql field <-> class property <-> typeorm column` and `graphql object <-> class name < -> typeorm table` (imported decorators from `nestjs-graphql-easy` removed the ability to set a name)

4. Decorators `Filter`, `Order` from `nestjs-graphql-easy` work only with loader types `ELoaderType.MANY` and `ELoaderType.ONE_TO_MANY`
5. Decorators `Pagination` from `nestjs-graphql-easy` work only with loader types `ELoaderType.MANY`

### Basic example

#### Entity/Object

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
} from 'nestjs-graphql-easy'; // <-- ADD

import { Book } from '../book/book.entity';

@ObjectType()
@Entity()
export class Author {
  /**
   * filterable - default = false
   * sortable - default = false
   * 
   * Put in true if you need filters or sorting 
   */
  @Field(() => ID, { filterable: true, sortable: true }) // <-- ADD
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

  /**
   * Relations for GraphQL must be made in Resolver via ResolveField
   */
  @OneToMany(() => Book, (book) => book.author, { onDelete: 'CASCADE' })
  public books: Book[];
}
```

#### Resolver

```ts
import { Context, GraphQLExecutionContext, Parent, Resolver } from '@nestjs/graphql';

import {
  Query,
  ResolveField,
  ELoaderType,
  Loader,
  Filter,
  Order,
  Pagination
} from 'nestjs-graphql-easy'; // <-- ADD

import { Book } from '../book/book.entity';
import { Author } from './author.entity';

@Resolver(() => Author)
export class AuthorResolver {
  @Query(() => [Author])
  public async authors(
    @Loader({ // <-- ADD
      loader_type: ELoaderType.MANY, 
      field_name: 'authors',
      entity: () => Author,
      entity_fk_key: 'id',
    }) field_alias: string,
    @Filter(() => Author) _filter: unknown, // <-- ADD if you need filters
    @Order(() => Author) _order: unknown, // <-- ADD if you need orders
    @Pagination() _pagination: unknown, // <-- ADD if you need paginations
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias];
  }

  @ResolveField(() => [Book], { nullable: true }) // <-- ADD
  public async books(
    @Parent() author: Author,
    @Loader({
      loader_type: ELoaderType.ONE_TO_MANY,
      field_name: 'books',
      entity: () => Book,
      entity_fk_key: 'author_id',
      entity_joins: [ // <-- ADD if you need default joins
        {
          query: 'book.author',
          alias: 'author',
        },
      ],
      entity_wheres: [ // <-- ADD if you need default filters
        {
          query: 'book.is_private = :is_private',
          params: { is_private: false },
        },
        {
          query: 'author.id IS NOT NULL', // <-- ADD if you added default joins
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
}
```

#### GraphQL query

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

### Polymorphic example

#### Entity/Object

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
} from 'nestjs-graphql-easy'; // <-- ADD

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

  /**
   * For a polymorphic relationship, the relationship in the Entity is not specified.
   * But you need to create columns for foreign key and table type.
   */

  @Field(() => ID, { filterable: true, sortable: true })
  @Index()
  @Column('uuid', { nullable: false })
  @PolymorphicColumn() // <-- ADD
  public itemable_id: string; // foreign key

  @Field(() => String, { filterable: true, sortable: true })
  @Index()
  @Column({ nullable: false })
  @PolymorphicColumn() // <-- ADD
  public itemable_type: string; // foreign type
}
```

#### Union type

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
import { Context, GraphQLExecutionContext, Parent, Resolver } from '@nestjs/graphql';

import {
  Query,
  ResolveField,
  ELoaderType,
  Loader,
  Filter,
  Order,
  Pagination
} from 'nestjs-graphql-easy'; // <-- ADD

import { Section } from '../section/section.entity';

import { Item } from './item.entity';
import { ItemableType } from './item.itemable';

@Resolver(() => Item)
export class ItemResolver {
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

  @ResolveField(() => ItemableType, { nullable: true }) // <-- ADD
  public async itemable(
    @Parent() item: Item,
    @Loader({
      loader_type: ELoaderType.POLYMORPHIC,
      field_name: 'itemable',
      // For a polymorphic relation, it is necessary to specify here not the Entity, but the Union type.
      entity: () => ItemableType, // <-- ADD
      entity_fk_key: 'id',
      entity_fk_type: 'itemable_type',
    }) field_alias: string,
    @Context() ctx: GraphQLExecutionContext
  ) {
    return await ctx[field_alias].load(item.itemable_id);
  }
}
```

### GraphQL query

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
