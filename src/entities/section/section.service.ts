import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../helper/service.helper';
import { Section } from './section.entity';

@Injectable()
export class SectionService extends ServiceHelper<Section> {
  constructor(
    @InjectRepository(Section) sectionRepository: Repository<Section>,
  ) {
    super(sectionRepository);
  }
}
