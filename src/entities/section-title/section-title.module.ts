import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SectionTitle } from './section-title.entity';
import { SectionTitleResolver } from './section-title.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([SectionTitle])],
  providers: [SectionTitleResolver],
  exports: [],
})
export class SectionTitleModule {}
