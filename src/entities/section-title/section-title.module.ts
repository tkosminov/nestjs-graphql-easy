import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SectionTitle } from './section-title.entity';
import { SectionTitleResolver } from './section-title.resolver';
import { SectionTitleService } from './section-title.service';

@Module({
  imports: [TypeOrmModule.forFeature([SectionTitle])],
  providers: [SectionTitleService, SectionTitleResolver],
  exports: [SectionTitleService],
})
export class SectionTitleModule {}
