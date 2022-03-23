import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../helper/service.helper';
import { ItemText } from './item-text.entity';

@Injectable()
export class ItemTextService extends ServiceHelper<ItemText> {
  constructor(@InjectRepository(ItemText) itemTextRepository: Repository<ItemText>) {
    super(itemTextRepository);
  }
}
