import { ID } from '@nestjs/graphql';

import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Field, ObjectType, Polymorphic } from '@gql';

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

  @ManyToOne(() => Section, { nullable: false })
  @JoinColumn({ name: 'section_id' })
  public section: Section;

  @Field(() => ID, { filterable: true, sortable: true })
  @Index()
  @Column('uuid', { nullable: false })
  @Polymorphic()
  public itemable_id: string;

  @Field(() => String, { filterable: true, sortable: true })
  @Index()
  @Column({ nullable: false })
  @Polymorphic()
  public itemable_type: string;
}
