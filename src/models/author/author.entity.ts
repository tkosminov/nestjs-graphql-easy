import { Extensions, ID } from '@nestjs/graphql';

import { Index, OneToMany, type Relation } from 'typeorm';
import { DateTimeISOResolver } from 'graphql-scalars';

import {
  ObjectType,
  Field,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  registerEnumType,
  EDataType,
} from 'nestjs-graphql-easy';

import { Book } from '../book/book.entity.js';

export enum EAuthorGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

registerEnumType(EAuthorGender, {
  name: 'EAuthorGender',
});

@ObjectType()
@Entity()
export class Author {
  @Field(() => ID, { filterable: true, sortable: true, nullable: false })
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Field(() => DateTimeISOResolver, { nullable: false })
  @CreateDateColumn({
    type: 'timestamp without time zone',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP',
  })
  public created_at!: Date;

  @Field(() => DateTimeISOResolver, {
    filterable: true,
    sortable: true,
    allow_filters_from: [EDataType.PRECISION],
  })
  @UpdateDateColumn({
    type: 'timestamp without time zone',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP',
  })
  public updated_at!: Date;

  @Extensions({ role: 'ADMIN' })
  @Field(() => String, {
    filterable: true,
    sortable: true,
    allow_filters_from: [EDataType.PRECISION],
    nullable: false,
  })
  @Index({ unique: true })
  @Column('character varying', { nullable: false })
  public name!: string;

  @Field(() => EAuthorGender, { filterable: true, nullable: false })
  @Index()
  @Column('enum', { enum: EAuthorGender, nullable: false })
  public gender!: EAuthorGender;

  @OneToMany(() => Book, (book) => book.author)
  public books: Relation<Book>[];
}
