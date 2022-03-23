import { Module } from '@nestjs/common';

import { AuthorModule } from './author/author.module';
import { BookModule } from './book/book.module';
import { ItemImageModule } from './item-image/item-image.module';
import { ItemTextModule } from './item-text/item-text.module';
import { ItemModule } from './item/item.module';
import { SectionModule } from './section/section.module';
import { SectionTitleModule } from './section-title/section-title.module';

@Module({
  imports: [AuthorModule, BookModule, SectionModule, SectionTitleModule, ItemModule, ItemTextModule, ItemImageModule],
  providers: [],
  exports: [AuthorModule, BookModule, SectionModule, SectionTitleModule, ItemModule, ItemTextModule, ItemImageModule],
})
export class EntitiesModule {}
