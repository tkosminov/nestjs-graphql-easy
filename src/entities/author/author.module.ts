import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Author } from './author.entity';
import { AuthorResolver } from './author.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Author])],
  providers: [AuthorResolver],
  exports: [],
})
export class AuthorModule {}
