import { MigrationInterface, QueryRunner } from 'typeorm';

export class Item1790081107048 implements MigrationInterface {
  name = 'Item1790081107048';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "section_id" uuid NOT NULL, "itemable_id" uuid NOT NULL, "itemable_type" character varying NOT NULL, CONSTRAINT "PK_d3c0c71f23e7adcf952a1d13423" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_950a1670e176236acb11f48cf7" ON "item"  ("section_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_2ca6a14e522a82229b8e95213a" ON "item"  ("itemable_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_c031495d0517e1e87eeeeae8ad" ON "item"  ("itemable_type") `);
    await queryRunner.query(
      `ALTER TABLE "item" ADD CONSTRAINT "FK_950a1670e176236acb11f48cf74" FOREIGN KEY ("section_id") REFERENCES "section"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "item" DROP CONSTRAINT "FK_950a1670e176236acb11f48cf74"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c031495d0517e1e87eeeeae8ad"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2ca6a14e522a82229b8e95213a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_950a1670e176236acb11f48cf7"`);
    await queryRunner.query(`DROP TABLE "item"`);
  }
}
