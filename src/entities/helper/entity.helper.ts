import { Field, ObjectType } from '@nestjs/graphql';

import { BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
export class EntityHelper extends BaseEntity {
  @Field()
  @CreateDateColumn({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public created_at: Date;

  @Field()
  @UpdateDateColumn({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public updated_at: Date;
}
