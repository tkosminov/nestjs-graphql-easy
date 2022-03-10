import { ID } from '@nestjs/graphql';

import { IsString } from 'class-validator';
import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Field, ObjectType } from '@gql/store';

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

  @Field(() => String, { filterable: true, sortable: true })
  @Column()
  @Index({ unique: true })
  @IsString()
  public name: string;

  @Field(() => [Book], { nullable: true })
  @OneToMany(() => Book, (book) => book.author, { onDelete: 'CASCADE' })
  public books: Book[];
}
