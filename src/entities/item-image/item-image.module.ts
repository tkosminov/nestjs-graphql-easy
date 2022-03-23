import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ItemImage } from './item-image.entity';
import { ItemImageService } from './item-image.service';

@Module({
  imports: [TypeOrmModule.forFeature([ItemImage])],
  providers: [ItemImageService],
  exports: [ItemImageService],
})
export class ItemImageModule {}
