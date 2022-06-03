import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ItemImage } from './item-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemImage])],
  providers: [],
  exports: [],
})
export class ItemImageModule {}
