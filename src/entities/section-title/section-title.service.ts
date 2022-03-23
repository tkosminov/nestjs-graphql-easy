import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../helper/service.helper';
import { SectionTitle } from './section-title.entity';

@Injectable()
export class SectionTitleService extends ServiceHelper<SectionTitle> {
  constructor(@InjectRepository(SectionTitle) sectionTitleRepository: Repository<SectionTitle>) {
    super(sectionTitleRepository);
  }
}
