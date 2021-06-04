import { Field, ID, ObjectType } from '@nestjs/graphql';

import { IsString, IsUUID } from 'class-validator';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { EntityHelper } from '../helper/entity.helper';
import { Author } from '../author/author.entity';
import { Section } from '../section/section.entity';

@ObjectType()
@Entity()
export class Book extends EntityHelper {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Field()
  @Column()
  @IsString()
  public title: string;

  @Field(() => ID)
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
