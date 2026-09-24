import { Field, InputType, Int } from '@nestjs/graphql';

import { IsInt, IsOptional, Min } from 'class-validator';

@InputType()
export class PaginationInputType {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  public page!: number;

  @Field(() => Int, { nullable: false })
  @IsInt()
  @Min(0)
  public per_page!: number;
}
