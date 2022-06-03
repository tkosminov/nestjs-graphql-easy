import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Item } from './item.entity';
import { ItemResolver } from './item.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Item])],
  providers: [ItemResolver],
  exports: [],
})
export class ItemModule {}
