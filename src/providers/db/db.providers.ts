import { createConnection } from 'typeorm';
import {MysqlConfig} from "../../entities/configs/mysql-config";
import {FactoryProvider} from "@nestjs/common/interfaces/modules/provider.interface";
import {MYSQL_MAIN_CONF, REDIS_MAIN_CONF} from "../config/config.providers";
import {RedisConfig} from "../../entities/configs/redis-config";
import * as redis from 'redis';

export const MYSQL_MAIN_CONN = 'MAIN_MYSQL_CONN';
export const REDIS_MAIN_CONN = 'REDIS_MAIN_CONN';

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
    {
        provide: REDIS_MAIN_CONN,
        useFactory: async (redisConf: RedisConfig) => await redis.createClient(
            redisConf.port,
            redisConf.host,
            {
                password: redisConf.password
            }
        ),
        inject: [REDIS_MAIN_CONF]
    } as FactoryProvider
];