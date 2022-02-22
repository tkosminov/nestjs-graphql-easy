import { Module } from '@nestjs/common';

import { AuthorModule } from './author/author.module';
import { BookModule } from './book/book.module';
import { SectionModule } from './section/section.module';
import { SectionTitleModule } from './section_title/section_title.module';

@Module({
  imports: [AuthorModule, BookModule, SectionModule, SectionTitleModule],
  providers: [],
  exports: [AuthorModule, BookModule, SectionModule, SectionTitleModule],
})
export class EntitiesModule {}
