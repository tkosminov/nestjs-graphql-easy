import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../helper/service.helper';
import { Author } from './author.entity';

@Injectable()
export class AuthorService extends ServiceHelper<Author> {
  constructor(@InjectRepository(Author) authorRepository: Repository<Author>) {
    super(authorRepository);
  }
}
