import { Extensions, ID } from '@nestjs/graphql';

import { Index, OneToMany } from 'typeorm';
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

import { Book } from '../book/book.entity';

export enum EAuthorGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

registerEnumType(EAuthorGender, {
  name: 'EAuthorGender',
});

export enum EAuthorType {
  AUTHOR = 1,
  CO_AUTHOR = 2,
}

registerEnumType(EAuthorType, {
  name: 'EAuthorType',
});

@ObjectType()
@Entity()
export class Author {
  @Field(() => ID, { filterable: true, sortable: true })
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Field(() => Date)
  @CreateDateColumn({
    type: 'timestamp without time zone',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP',
  })
  public created_at: Date;

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
  public updated_at: Date;

  @Extensions({ role: 'ADMIN' })
  @Field(() => String, {
    filterable: true,
    sortable: true,
    allow_filters_from: [EDataType.PRECISION],
  })
  @Column()
  @Index({ unique: true })
  public name: string;

  @Field(() => EAuthorGender, { filterable: true })
  @Column('enum', { enum: EAuthorGender, nullable: false })
  @Index()
  public gender: EAuthorGender;

  @Field(() => EAuthorType, { filterable: true })
  @Column('enum', { enum: EAuthorType, nullable: false })
  @Index()
  public author_type: EAuthorType;

  @OneToMany(() => Book, (book) => book.author)
  public books: Book[];
}
