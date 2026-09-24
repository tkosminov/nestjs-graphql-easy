import { Module } from '@nestjs/common';

import { BookResolver } from './book.resolver.js';

@Module({
  providers: [BookResolver],
})
export class BookModule {}
