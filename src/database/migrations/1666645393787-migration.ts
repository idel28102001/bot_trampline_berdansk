import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1666645393787 implements MigrationInterface {
    name = 'migration1666645393787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "coupons" ("id" SERIAL NOT NULL, "relative" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "PK_d7ea8864a0150183770f3e9a8cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'SELLER', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "telegramId" character varying NOT NULL, "phoneNumber" character varying, "username" character varying, "firstname" character varying, "lastname" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "wantToBeSeller" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_df18d17f84763558ac84192c754" UNIQUE ("telegramId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."coupons-user_status_enum" AS ENUM('used', 'expire', 'new')`);
        await queryRunner.query(`CREATE TABLE "coupons-user" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "value" character varying NOT NULL, "status" "public"."coupons-user_status_enum" NOT NULL DEFAULT 'new', "userId" integer, "couponId" integer, CONSTRAINT "PK_52ee9b0616988a8df73e8c85df6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "coupons-user" ADD CONSTRAINT "FK_6a1f3f628128079176e98122587" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coupons-user" ADD CONSTRAINT "FK_2e2a6b2217dd0aa9163d2827a98" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coupons-user" DROP CONSTRAINT "FK_2e2a6b2217dd0aa9163d2827a98"`);
        await queryRunner.query(`ALTER TABLE "coupons-user" DROP CONSTRAINT "FK_6a1f3f628128079176e98122587"`);
        await queryRunner.query(`DROP TABLE "coupons-user"`);
        await queryRunner.query(`DROP TYPE "public"."coupons-user_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "coupons"`);
    }

}
