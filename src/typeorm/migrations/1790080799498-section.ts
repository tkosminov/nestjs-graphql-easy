import { MigrationInterface, QueryRunner } from 'typeorm';

export class Section1790080799498 implements MigrationInterface {
  name = 'Section1790080799498';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "section" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "title" character varying NOT NULL, "book_id" uuid NOT NULL, CONSTRAINT "PK_3c41d2d699384cc5e8eac54777d" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_a1c00fe0a0478cd2e578cc83e0" ON "section"  ("book_id") `);
    await queryRunner.query(
      `ALTER TABLE "section" ADD CONSTRAINT "FK_a1c00fe0a0478cd2e578cc83e02" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "section" DROP CONSTRAINT "FK_a1c00fe0a0478cd2e578cc83e02"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a1c00fe0a0478cd2e578cc83e0"`);
    await queryRunner.query(`DROP TABLE "section"`);
  }
}
