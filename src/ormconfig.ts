import config from "config";
import {MysqlConfig} from "./entities/configs/mysql-config";
import { ConnectionOptions } from 'typeorm';

const mysqlConf = config.get<MysqlConfig>('mysql') as MysqlConfig;

const typeOrmConfig: ConnectionOptions = {
    type: 'mysql',
    "database": mysqlConf.database,
    "host": mysqlConf.host,
    "port": mysqlConf.port,
    "username": mysqlConf.user,
    "password": mysqlConf.password,
    "timezone": mysqlConf.timezone,
    "cli": {
        "migrationsDir": "src/" + mysqlConf.migrations
    },
    "migrations": ["src/" + mysqlConf.migrations + "/*.ts"],
    "synchronize": mysqlConf.synchronize,
    "migrationsRun": mysqlConf.migrationsRun,
}

export = typeOrmConfig;