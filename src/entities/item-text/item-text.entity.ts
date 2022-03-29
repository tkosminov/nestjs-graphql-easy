import { ID } from '@nestjs/graphql';

import { Field, ObjectType, Column, Entity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'nestjs-graphql-easy';

@ObjectType()
@Entity()
export class ItemText {
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

  @Field(() => String, { nullable: false })
  @Column()
  public value: string;
}
