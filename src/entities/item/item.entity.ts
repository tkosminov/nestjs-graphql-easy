import { ID } from '@nestjs/graphql';

import { Index, JoinColumn, ManyToOne } from 'typeorm';

import {
  Field,
  ObjectType,
  PolymorphicColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'nestjs-graphql-easy';

import { Section } from '../section/section.entity';

@ObjectType()
@Entity()
export class Item {
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

  @Field(() => ID, { filterable: true, sortable: true })
  @Index()
  @Column('uuid', { nullable: false })
  public section_id: string;

  @ManyToOne(() => Section, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'section_id' })
  public section: Section;

  @Field(() => ID, { filterable: true, sortable: true })
  @Index()
  @Column('uuid', { nullable: false })
  @PolymorphicColumn()
  public itemable_id: string;

  @Field(() => String, { filterable: true, sortable: true })
  @Index()
  @Column({ nullable: false })
  @PolymorphicColumn()
  public itemable_type: string;
}
