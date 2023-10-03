import { Args, Field, InputType, Int } from '@nestjs/graphql';

import { IsInt, IsOptional, Min } from 'class-validator';

@InputType()
export class PaginationInputType {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  page: number;

  @Field(() => Int, { nullable: false })
  @IsInt()
  @Min(0)
  per_page: number;
}

export const Pagination = () => {
  return Args({
    name: 'PAGINATION',
    nullable: true,
    type: () => PaginationInputType,
  });
};
