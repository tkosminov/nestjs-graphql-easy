import { ID } from '@nestjs/graphql';

import { IsString, IsUUID } from 'class-validator';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Field, ObjectType } from '../../graphql/store';

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
  public section_id: string;

  @Field(() => Section)
  @OneToOne(() => Section, (section) => section.section_title)
  @JoinColumn({ name: 'section_id' })
  public section: Section;
}
