import { Module } from '@nestjs/common';

import { SectionResolver } from './section.resolver.js';

@Module({
  providers: [SectionResolver],
})
export class SectionModule {}
