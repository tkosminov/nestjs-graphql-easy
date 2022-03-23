import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../helper/service.helper';
import { Item } from './item.entity';

@Injectable()
export class ItemService extends ServiceHelper<Item> {
  constructor(@InjectRepository(Item) itemRepository: Repository<Item>) {
    super(itemRepository);
  }
}
