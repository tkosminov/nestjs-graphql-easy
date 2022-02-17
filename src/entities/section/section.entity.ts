import { ID } from '@nestjs/graphql';

import { IsString, IsUUID } from 'class-validator';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Field, ObjectType } from '../../graphql/store';

import { Book } from '../book/book.entity';

@ObjectType()
@Entity()
export class Section {
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
  public book_id: string;

  @Field(() => Book)
  @ManyToOne(() => Book, { nullable: false })
  @JoinColumn({ name: 'book_id' })
  public book: Book;
}
