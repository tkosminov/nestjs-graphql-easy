/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { MigrationInterface, QueryRunner } from 'typeorm';

import { Author, EAuthorGender, EAuthorType } from '../../entities/author/author.entity';
import { Book } from '../../entities/book/book.entity';
import { Section } from '../../entities/section/section.entity';
import { SectionTitle } from '../../entities/section-title/section-title.entity';
import { Item } from '../../entities/item/item.entity';
import { ItemText } from '../../entities/item-text/item-text.entity';
import { ItemImage } from '../../entities/item-image/item-image.entity';

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
          gender: EAuthorGender.MALE,
          author_type: EAuthorType.AUTHOR,
        },
        {
          id: '9363ec6f-a3ef-4c13-91da-fd40352e1936',
          name: 'Author 2',
          gender: EAuthorGender.FEMALE,
          author_type: EAuthorType.AUTHOR,
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
          id: '0d38ac59-3803-47e0-a4fb-b95e5fd74c42',
          title: 'Book 1 Author 2',
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
          id: 'c3e29f78-1803-4e04-9979-ad6167a7c762',
          book_id: '0d38ac59-3803-47e0-a4fb-b95e5fd74c42',
          title: 'Book 1 Author 2 Section 1',
        },
      ])
      .execute();

    await queryRunner.connection
      .createQueryBuilder()
      .insert()
      .into(SectionTitle)
      .values([
        {
          id: '25c03eef-b317-42c2-8292-73794597856a',
          section_id: '57c82b1d-2f5e-4145-8dc6-b2d883236ef1',
          title: 'Book 1 Author 1 Section 1 SectionTitle 1',
        },
        {
          id: '400b55ab-d336-446a-811b-466c66c6a612',
          section_id: 'c3e29f78-1803-4e04-9979-ad6167a7c762',
          title: 'Book 1 Author 2 Section 1 SectionTitle 1',
        },
      ])
      .execute();

    await queryRunner.connection
      .createQueryBuilder()
      .insert()
      .into(ItemText)
      .values([
        {
          id: '1acb98de-8295-4106-9988-612b1bdda4d4',
          value: 'Item Text 1',
        },
      ])
      .execute();

    await queryRunner.connection
      .createQueryBuilder()
      .insert()
      .into(ItemImage)
      .values([
        {
          id: '5c94c6b6-d923-45bb-8d6e-b133644a4010',
          file_url: 'Item Image 1',
        },
      ])
      .execute();

    await queryRunner.connection
      .createQueryBuilder()
      .insert()
      .into(Item)
      .values([
        {
          id: 'e4c162ea-f8a0-4656-8a2d-9755b5412da3',
          itemable_id: '1acb98de-8295-4106-9988-612b1bdda4d4',
          itemable_type: 'ItemText',
          section_id: '57c82b1d-2f5e-4145-8dc6-b2d883236ef1',
        },
        {
          id: 'ebc4df69-a55c-454c-abe1-b8dee2986cc7',
          itemable_id: '5c94c6b6-d923-45bb-8d6e-b133644a4010',
          itemable_type: 'ItemImage',
          section_id: 'c3e29f78-1803-4e04-9979-ad6167a7c762',
        },
      ])
      .execute();
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
