import { ID } from '@nestjs/graphql';

import { Index, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';

import { Field, ObjectType, Column, Entity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from '@gql';

import { Book } from '../book/book.entity';
import { SectionTitle } from '../section-title/section-title.entity';
import { Item } from '../item/item.entity';

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
  public title: string;

  @Field(() => ID, { filterable: true, sortable: true })
  @Index()
  @Column('uuid', { nullable: false })
  public book_id: string;

  @ManyToOne(() => Book, { nullable: false })
  @JoinColumn({ name: 'book_id' })
  public book: Book;

  @OneToOne(() => SectionTitle, (section_title) => section_title.section)
  public section_title: SectionTitle;

  @OneToMany(() => Item, (item) => item.section, { onDelete: 'CASCADE' })
  public items: Item[];
}
