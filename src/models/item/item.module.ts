import { Module } from '@nestjs/common';

import { ItemResolver } from './item.resolver.js';

@Module({
  providers: [ItemResolver],
})
export class ItemModule {}
