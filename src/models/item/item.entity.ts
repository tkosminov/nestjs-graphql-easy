import { ID } from '@nestjs/graphql';

import { DateTimeISOResolver } from 'graphql-scalars';
import { Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

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

import { Section } from '../section/section.entity.js';

@ObjectType()
@Entity()
export class Item {
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

  @Field(() => ID, { filterable: true, sortable: true, nullable: false })
  @Index()
  @Column('uuid', { nullable: false })
  public section_id!: string;

  @ManyToOne(() => Section, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'section_id' })
  public section!: Relation<Section>;

  @Field(() => ID, { filterable: true, sortable: true, nullable: false })
  @Index()
  @Column('uuid', { nullable: false })
  @PolymorphicColumn()
  public itemable_id!: string;

  @Field(() => String, { filterable: true, sortable: true, nullable: false })
  @Index()
  @Column({ nullable: false })
  @PolymorphicColumn()
  public itemable_type!: string;
}
