import { Module } from '@nestjs/common';

import { AuthorModule } from './author/author.module.js';
import { BookModule } from './book/book.module.js';
import { SectionModule } from './section/section.module.js';
import { ItemModule } from './item/item.module.js';

@Module({
  imports: [AuthorModule, BookModule, SectionModule, ItemModule],
})
export class ModelsModule {}
