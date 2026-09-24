import { MigrationInterface, QueryRunner } from 'typeorm';

export class ItemImage1790081576330 implements MigrationInterface {
  name = 'ItemImage1790081576330';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "item_image" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "file_url" character varying NOT NULL, CONSTRAINT "PK_6530fd4d0bbd05681b883bd63f2" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "item_image"`);
  }
}
