import { MigrationInterface, QueryRunner } from 'typeorm';

export class Seed1790164611481 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO author (id, name, gender) VALUES ('d059c639-8293-44e4-986b-13de87bd57d5', 'Author 1', 'MALE')`);
    await queryRunner.query(
      `INSERT INTO book (id, author_id, title) VALUES ('d46af36b-10c1-4e2e-bc43-0d7ec0519574', 'd059c639-8293-44e4-986b-13de87bd57d5', 'Book 1')`
    );
    await queryRunner.query(
      `INSERT INTO section (id, book_id, title) VALUES ('06f2d263-d84c-47e8-99c8-4e0e2d593893', 'd46af36b-10c1-4e2e-bc43-0d7ec0519574', 'Section 1')`
    );
    await queryRunner.query(`INSERT INTO item_text (id, value) VALUES ('063f51b0-4c2f-4b1f-8a03-96bdb8f4cc77', 'ItemText 1')`);
    await queryRunner.query(
      `INSERT INTO item (id, section_id, itemable_id, itemable_type) VALUES ('b14b3e57-95fe-4956-b963-831756bbc731', '06f2d263-d84c-47e8-99c8-4e0e2d593893', '063f51b0-4c2f-4b1f-8a03-96bdb8f4cc77', 'ItemText')`
    );
    await queryRunner.query(`INSERT INTO item_image (id, file_url) VALUES ('b1206de0-d8a6-4370-bd48-c4ecb515c9a9', 'ItemImage 1')`);
    await queryRunner.query(
      `INSERT INTO item (id, section_id, itemable_id, itemable_type) VALUES ('689ec87d-3ff3-48b0-ae48-14c1d23bf28e', '06f2d263-d84c-47e8-99c8-4e0e2d593893', 'b1206de0-d8a6-4370-bd48-c4ecb515c9a9', 'ItemImage')`
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
