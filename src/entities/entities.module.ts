import { Module } from '@nestjs/common';

import { AuthorModule } from './author/author.module';
import { BookModule } from './book/book.module';
import { SectionModule } from './section/section.module';

@Module({
  imports: [AuthorModule, BookModule, SectionModule],
  providers: [],
  exports: [AuthorModule, BookModule, SectionModule],
})
export class EntitiesModule {}
