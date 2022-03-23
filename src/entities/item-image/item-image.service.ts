import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../helper/service.helper';
import { ItemImage } from './item-image.entity';

@Injectable()
export class ItemImageService extends ServiceHelper<ItemImage> {
  constructor(@InjectRepository(ItemImage) itemImageRepository: Repository<ItemImage>) {
    super(itemImageRepository);
  }
}
