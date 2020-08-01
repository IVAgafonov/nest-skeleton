import {MigrationInterface, QueryRunner} from "typeorm";

export class UserAuthTokens1595103252335 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `app_users_auth_tokens` (\n" +
            "  `token` binary(32) NOT NULL,\n" +
            "  `user_id` int(13) NOT NULL,\n" +
            "  `create_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n" +
            "  `expire_date` timestamp NULL,\n" +
            "  `type` enum('TEMPORARY','PERMANENT') COLLATE utf8mb4_bin NOT NULL DEFAULT 'TEMPORARY',\n" +
            "  PRIMARY KEY (`token`),\n" +
            "  KEY `user_id` (`user_id`)\n" +
            ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin")
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
