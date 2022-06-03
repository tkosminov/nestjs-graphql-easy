import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ItemText } from './item-text.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemText])],
  providers: [],
  exports: [],
})
export class ItemTextModule {}
