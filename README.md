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

### Entity example

```ts
import { Extensions, ID } from '@nestjs/graphql';

import { IsString } from 'class-validator';
import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Field, ObjectType } from '@gql/store';
import { checkRoleMiddleware } from '@gql/permission/field.middleware';

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

  @Extensions({ role: 'ADMIN' })
  @Field(() => String, { filterable: true, sortable: true, middleware: [checkRoleMiddleware] })
  @Column()
  @Index({ unique: true })
  @IsString()
  public name: string;

  @OneToMany(() => Book, (book) => book.author, { onDelete: 'CASCADE' })
  public books: Book[];
}


```

### Resolver example

```ts
import { Args, Context, GraphQLExecutionContext, ID, Parent, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Query, ResolveField } from '@gql/store';
import { ELoaderType, Loader } from '@gql/loader/decorator.loader';
import { Filter } from '@gql/filter/decorator.filter';
import { Order } from '@gql/order/decorator.order';
import { Pagination } from '@gql/pagination/decorator.pagination';
import { GqlAuthGuard } from '@gql/permission/resolver.guard';

import { Book } from '../book/book.entity';
import { Author } from './author.entity';
import { AuthorService } from './author.service';

@Resolver(() => Author)
export class AuthorResolver {
  constructor(private readonly authorService: AuthorService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [Author])
  public async authors(
    @Loader({
      loader_type: ELoaderType.MANY,
      field_name: 'authors',
      relation_table: 'author',
      relation_fk: 'id',
    })
    field_alias: string,
    @Filter({
      relation_table: 'author',
    })
    _filter: unknown,
    @Order({
      relation_table: 'author',
    })
    _order: unknown,
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
      relation_table: 'book',
      relation_fk: 'author_id',
    })
    field_alias: string,
    @Filter({
      relation_table: 'book',
    })
    _filter: unknown,
    @Order({
      relation_table: 'book',
    })
    _order: unknown,
    @Context() ctx: GraphQLExecutionContext
  ): Promise<Book[]> {
    return await ctx[field_alias].load(author.id);
  }
}
```

### GraphQL Query example

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
