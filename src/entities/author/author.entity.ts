import { Extensions, ID } from '@nestjs/graphql';

import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { ObjectType, Field, middlewares } from '@gql';

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
  @Field(() => String, { filterable: true, sortable: true, middleware: [middlewares.role] })
  @Column()
  @Index({ unique: true })
  public name: string;

  @OneToMany(() => Book, (book) => book.author, { onDelete: 'CASCADE' })
  public books: Book[];
}
