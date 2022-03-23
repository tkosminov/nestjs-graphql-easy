import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ItemText } from './item-text.entity';
import { ItemTextService } from './item-text.service';

@Module({
  imports: [TypeOrmModule.forFeature([ItemText])],
  providers: [ItemTextService],
  exports: [ItemTextService],
})
export class ItemTextModule {}
