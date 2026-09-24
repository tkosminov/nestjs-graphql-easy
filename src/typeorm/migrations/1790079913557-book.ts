import { MigrationInterface, QueryRunner } from 'typeorm';

export class Book1790079913557 implements MigrationInterface {
  name = 'Book1790079913557';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "book" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "title" character varying NOT NULL, "is_private" boolean NOT NULL DEFAULT false, "author_id" uuid NOT NULL, CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_6849f7d295967738326a79d7a4" ON "book"  ("is_private") `);
    await queryRunner.query(`CREATE INDEX "IDX_24b753b0490a992a6941451f40" ON "book"  ("author_id") `);
    await queryRunner.query(
      `ALTER TABLE "book" ADD CONSTRAINT "FK_24b753b0490a992a6941451f405" FOREIGN KEY ("author_id") REFERENCES "author"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_24b753b0490a992a6941451f405"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_24b753b0490a992a6941451f40"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6849f7d295967738326a79d7a4"`);
    await queryRunner.query(`DROP TABLE "book"`);
  }
}
