import { MigrationInterface, QueryRunner } from 'typeorm';

export class Author1790079553185 implements MigrationInterface {
  name = 'Author1790079553185';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."author_gender_enum" AS ENUM('MALE', 'FEMALE')`);
    await queryRunner.query(
      `CREATE TABLE "author" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "name" character varying NOT NULL, "gender" "public"."author_gender_enum" NOT NULL, CONSTRAINT "PK_5a0e79799d372fe56f2f3fa6871" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d3962fd11a54d87f927e84d108" ON "author"  ("name") `);
    await queryRunner.query(`CREATE INDEX "IDX_5c615196cbc5bacc383675731f" ON "author"  ("gender") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_5c615196cbc5bacc383675731f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d3962fd11a54d87f927e84d108"`);
    await queryRunner.query(`DROP TABLE "author"`);
    await queryRunner.query(`DROP TYPE "public"."author_gender_enum"`);
  }
}
