import { ID } from '@nestjs/graphql';

import { Index, JoinColumn, OneToOne } from 'typeorm';

import { Field, ObjectType, Column, Entity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'nestjs-graphql-easy';

import { Section } from '../section/section.entity';

@ObjectType()
@Entity()
export class SectionTitle {
  @Field(() => ID, { filterable: true, sortable: true })
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Field(() => Date)
  @CreateDateColumn({
    type: 'timestamp without time zone',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP',
  })
  public created_at: Date;

  @Field(() => Date)
  @UpdateDateColumn({
    type: 'timestamp without time zone',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP',
  })
  public updated_at: Date;

  @Field(() => String)
  @Column()
  public title: string;

  @Field(() => ID, { filterable: true, sortable: true })
  @Index()
  @Column('uuid', { nullable: false })
  public section_id: string;

  @OneToOne(() => Section, (section) => section.section_title)
  @JoinColumn({ name: 'section_id' })
  public section: Section;
}
