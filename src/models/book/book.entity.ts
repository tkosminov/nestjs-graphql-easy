import { ID } from '@nestjs/graphql';

import { DateTimeISOResolver } from 'graphql-scalars';
import { Index, JoinColumn, ManyToOne, OneToMany, type Relation } from 'typeorm';

import { Field, ObjectType, Column, Entity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'nestjs-graphql-easy';

import { Author } from '../author/author.entity.js';
import { Section } from '../section/section.entity.js';

@ObjectType()
@Entity()
export class Book {
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

  @Field(() => Boolean, { filterable: true, nullable: false })
  @Index()
  @Column('boolean', { nullable: false, default: () => 'false' })
  public is_private!: boolean;

  @Field(() => ID, { filterable: true, sortable: true, nullable: false })
  @Index()
  @Column('uuid', { nullable: false })
  public author_id!: string;

  @ManyToOne(() => Author, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  public author!: Relation<Author>;

  @OneToMany(() => Section, (section) => section.book)
  public sections: Relation<Section>[];
}
