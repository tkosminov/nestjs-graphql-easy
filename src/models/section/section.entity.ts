import { ID } from '@nestjs/graphql';

import { DateTimeISOResolver } from 'graphql-scalars';
import { Index, JoinColumn, ManyToOne, OneToMany, type Relation } from 'typeorm';

import { Field, ObjectType, Column, Entity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'nestjs-graphql-easy';

import { Book } from '../book/book.entity.js';
import { Item } from '../item/item.entity.js';

@ObjectType()
@Entity()
export class Section {
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

  @Field(() => DateTimeISOResolver, { nullable: false })
  @UpdateDateColumn({
    type: 'timestamp without time zone',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP',
  })
  public updated_at!: Date;

  @Field(() => String, { nullable: false })
  @Column('character varying', { nullable: false })
  public title!: string;

  @Field(() => ID, { filterable: true, sortable: true, nullable: false })
  @Index()
  @Column('uuid', { nullable: false })
  public book_id!: string;

  @ManyToOne(() => Book, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  public book!: Relation<Book>;

  @OneToMany(() => Item, (item) => item.section)
  public items: Relation<Item>[];
}
