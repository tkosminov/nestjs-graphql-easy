/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { MigrationInterface, QueryRunner } from 'typeorm';

import { Author } from '../../entities/author/author.entity';
import { Book } from '../../entities/book/book.entity';
import { Section } from '../../entities/section/section.entity';

export class seed1588955268370 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.connection
      .createQueryBuilder()
      .insert()
      .into(Author)
      .values([
        {
          id: '1049e157-ff4c-45ff-a40c-2ed44030a5e6',
          name: 'Author 1',
        },
        {
          id: '9363ec6f-a3ef-4c13-91da-fd40352e1936',
          name: 'Author 2',
        },
      ])
      .execute();

    await queryRunner.connection
      .createQueryBuilder()
      .insert()
      .into(Book)
      .values([
        {
          id: 'be5f23d4-82e9-4603-9282-84015adf081b',
          title: 'Book 1 Author 1',
          author_id: '1049e157-ff4c-45ff-a40c-2ed44030a5e6',
        },
        {
          id: '69287a42-b798-4b26-933c-bb8a7e5287e6',
          title: 'Book 2 Author 1',
          author_id: '1049e157-ff4c-45ff-a40c-2ed44030a5e6',
        },
        {
          id: '0d38ac59-3803-47e0-a4fb-b95e5fd74c42',
          title: 'Book 1 Author 2',
          author_id: '9363ec6f-a3ef-4c13-91da-fd40352e1936',
        },
        {
          id: '6b4fb320-f24f-4e92-b443-9aa841b294d9',
          title: 'Book 2 Author 2',
          author_id: '9363ec6f-a3ef-4c13-91da-fd40352e1936',
        },
      ])
      .execute();

    await queryRunner.connection
      .createQueryBuilder()
      .insert()
      .into(Section)
      .values([
        {
          id: '57c82b1d-2f5e-4145-8dc6-b2d883236ef1',
          book_id: 'be5f23d4-82e9-4603-9282-84015adf081b',
          title: 'Book 1 Author 1 Section 1',
        },
        {
          id: '06b334a4-1294-4970-b8b7-41cde617692e',
          book_id: '69287a42-b798-4b26-933c-bb8a7e5287e6',
          title: 'Book 2 Author 1 Section 1',
        },
        {
          id: 'c3e29f78-1803-4e04-9979-ad6167a7c762',
          book_id: '0d38ac59-3803-47e0-a4fb-b95e5fd74c42',
          title: 'Book 1 Author 2 Section 1',
        },
        {
          id: 'a5b6dbfc-8bdc-466c-bda5-ce66fe4a0e87',
          book_id: '6b4fb320-f24f-4e92-b443-9aa841b294d9',
          title: 'Book 2 Author 2 Section 1',
        },
      ])
      .execute();
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
