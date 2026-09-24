import { MigrationInterface, QueryRunner } from 'typeorm';

export class ItemText1790081733008 implements MigrationInterface {
  name = 'ItemText1790081733008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "item_text" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "value" character varying NOT NULL, CONSTRAINT "PK_d9c89a10b9d2b9f072901c73027" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "item_text"`);
  }
}
