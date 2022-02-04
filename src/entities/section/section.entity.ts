import { Field, ID, ObjectType } from '@nestjs/graphql';

import { IsString, IsUUID } from 'class-validator';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { EntityHelper } from '../helper/entity.helper';
import { Book } from '../book/book.entity';

@ObjectType()
@Entity()
export class Section extends EntityHelper {
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
  public book_id: string;

  @Field(() => Book)
  @ManyToOne(() => Book, { nullable: false })
  @JoinColumn({ name: 'book_id' })
  public book: Book;
}
