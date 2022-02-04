import { Field, ID, ObjectType } from '@nestjs/graphql';

import { IsNumber, IsString } from 'class-validator';
import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Book } from '../book/book.entity';
import { EntityHelper } from '../helper/entity.helper';

@ObjectType()
@Entity()
export class Author extends EntityHelper {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Field()
  @Column()
  @Index({ unique: true })
  @IsString()
  public name: string;

  @Field(() => [Book], { nullable: true })
  @OneToMany(() => Book, (book) => book.author, { onDelete: 'CASCADE' })
  public books: Book[];
}
