import { createConnection } from 'typeorm';
import {MysqlConfig} from "../../entities/configs/mysql-config";
import {FactoryProvider} from "@nestjs/common/interfaces/modules/provider.interface";
import {MYSQL_MAIN_CONF} from "../config/config.providers";

export const MYSQL_MAIN_CONN = 'MAIN_MYSQL_CONN'

export const dbProviders = [
    {
        provide: MYSQL_MAIN_CONN,
        useFactory: async (mysqlConf: MysqlConfig) => await createConnection({
            type: 'mysql',
            host: mysqlConf.host,
            port: mysqlConf.port,
            username: mysqlConf.user,
            password: mysqlConf.password,
            database: mysqlConf.database,
            synchronize: mysqlConf.synchronize,
            migrationsRun: mysqlConf.migrationsRun,
            cli: {
                migrationsDir: "build/" + mysqlConf.migrations
            },
            migrations: ["build/" + mysqlConf.migrations + "/*.js"],
            extra: {insecureAuth: true}
        }),
        inject: [MYSQL_MAIN_CONF]
    } as FactoryProvider,
];