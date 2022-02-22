import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SectionTitle } from './section_title.entity';
import { SectionTitleResolver } from './section_title.resolver';
import { SectionTitleService } from './section_title.service';

@Module({
  imports: [TypeOrmModule.forFeature([SectionTitle])],
  providers: [SectionTitleService, SectionTitleResolver],
  exports: [SectionTitleService],
})
export class SectionTitleModule {}
