import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1666973629389 implements MigrationInterface {
    name = 'migration1666973629389'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "events" ("id" SERIAL NOT NULL, "relative" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "messageId" integer NOT NULL, "dateToRelease" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "eventId" integer`);
        await queryRunner.query(`ALTER TABLE "coupons-user" ALTER COLUMN "status" SET DEFAULT 'new'`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_5e291ec4136c4ff920487ed61ab" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_5e291ec4136c4ff920487ed61ab"`);
        await queryRunner.query(`ALTER TABLE "coupons-user" ALTER COLUMN "status" SET DEFAULT 'new'-user_status_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "eventId"`);
        await queryRunner.query(`DROP TABLE "events"`);
    }

}
