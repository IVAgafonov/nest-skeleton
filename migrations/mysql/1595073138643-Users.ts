import {MigrationInterface, QueryRunner} from "typeorm";

export class Users1595073138643 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `app_users` (\n" +
            "  `id` int(13) unsigned NOT NULL AUTO_INCREMENT,\n" +
            "  `name` varchar(255) COLLATE utf8mb4_bin NOT NULL,\n" +
            "  `email` varchar(255) COLLATE utf8mb4_bin NOT NULL,\n" +
            "  `password` binary(32) NOT NULL,\n" +
            "  `groups` set('USER','ADMIN') COLLATE utf8mb4_bin NOT NULL DEFAULT 'USER',\n" +
            "  `create_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n" +
            "  `delete_date` timestamp NULL DEFAULT NULL,\n" +
            "  PRIMARY KEY (`id`),\n" +
            "  UNIQUE KEY `email` (`email`)\n" +
            ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
