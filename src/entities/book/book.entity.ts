import { ID } from '@nestjs/graphql';

import { IsString, IsUUID } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Field, ObjectType } from '@gql/store';

import { Author } from '../author/author.entity';
import { Section } from '../section/section.entity';

@ObjectType()
@Entity()
export class Book {
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

  @Field(() => String)
  @Column()
  @IsString()
  public title: string;

  @Field(() => ID, { filterable: true, sortable: true })
  @Index()
  @Column('uuid', { nullable: false })
  @IsUUID()
  public author_id: string;

  @Field(() => Author)
  @ManyToOne(() => Author, { nullable: false })
  @JoinColumn({ name: 'author_id' })
  public author: Author;

  @Field(() => [Section], { nullable: true })
  @OneToMany(() => Section, (section) => section.book, { onDelete: 'CASCADE' })
  public sections: Section[];
}
