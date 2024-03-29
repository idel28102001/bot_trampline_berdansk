import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1694760301032 implements MigrationInterface {
    name = 'migration1694760301032'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "coupons" ("id" SERIAL NOT NULL, "relative" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "PK_d7ea8864a0150183770f3e9a8cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."coupons-user_status_enum" AS ENUM('used', 'expire', 'new')`);
        await queryRunner.query(`CREATE TABLE "coupons-user" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "value" character varying NOT NULL, "status" "public"."coupons-user_status_enum" NOT NULL DEFAULT 'new', "userId" integer, "couponId" integer, CONSTRAINT "PK_52ee9b0616988a8df73e8c85df6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."codes_status_enum" AS ENUM('UNUSED', 'USED')`);
        await queryRunner.query(`CREATE TABLE "codes" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."codes_status_enum" NOT NULL DEFAULT 'UNUSED', "date_expiration" TIMESTAMP NOT NULL, "max_count_use" integer NOT NULL, "code" character varying NOT NULL, "title" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_b384bf1b438808f45a0971fce65" UNIQUE ("code"), CONSTRAINT "PK_9b85c624e2d705f4e8a9b64dbf4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'SELLER', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "telegramId" character varying NOT NULL, "phoneNumber" character varying, "username" character varying, "firstname" character varying, "lastname" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "wantToBeSeller" boolean NOT NULL DEFAULT false, "eventId" integer, CONSTRAINT "UQ_df18d17f84763558ac84192c754" UNIQUE ("telegramId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "events" ("id" SERIAL NOT NULL, "relative" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "messageId" integer NOT NULL, "dateToRelease" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users_codes_codes" ("usersId" integer NOT NULL, "codesId" integer NOT NULL, CONSTRAINT "PK_fe4c2fb543c2bd266e30e2c1677" PRIMARY KEY ("usersId", "codesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_553c113d2099213a57b55b95fb" ON "users_codes_codes" ("usersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_9a2395b704c306ba34e99650ba" ON "users_codes_codes" ("codesId") `);
        await queryRunner.query(`ALTER TABLE "coupons-user" ADD CONSTRAINT "FK_6a1f3f628128079176e98122587" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coupons-user" ADD CONSTRAINT "FK_2e2a6b2217dd0aa9163d2827a98" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_5e291ec4136c4ff920487ed61ab" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users_codes_codes" ADD CONSTRAINT "FK_553c113d2099213a57b55b95fbc" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_codes_codes" ADD CONSTRAINT "FK_9a2395b704c306ba34e99650ba7" FOREIGN KEY ("codesId") REFERENCES "codes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_codes_codes" DROP CONSTRAINT "FK_9a2395b704c306ba34e99650ba7"`);
        await queryRunner.query(`ALTER TABLE "users_codes_codes" DROP CONSTRAINT "FK_553c113d2099213a57b55b95fbc"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_5e291ec4136c4ff920487ed61ab"`);
        await queryRunner.query(`ALTER TABLE "coupons-user" DROP CONSTRAINT "FK_2e2a6b2217dd0aa9163d2827a98"`);
        await queryRunner.query(`ALTER TABLE "coupons-user" DROP CONSTRAINT "FK_6a1f3f628128079176e98122587"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9a2395b704c306ba34e99650ba"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_553c113d2099213a57b55b95fb"`);
        await queryRunner.query(`DROP TABLE "users_codes_codes"`);
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "codes"`);
        await queryRunner.query(`DROP TYPE "public"."codes_status_enum"`);
        await queryRunner.query(`DROP TABLE "coupons-user"`);
        await queryRunner.query(`DROP TYPE "public"."coupons-user_status_enum"`);
        await queryRunner.query(`DROP TABLE "coupons"`);
    }

}
