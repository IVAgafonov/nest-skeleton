import config from "config";
import {MysqlConf} from "./entities/configs/mysql-config";
import { ConnectionOptions } from 'typeorm';

const mysqlConf = config.get<MysqlConf>('mysql') as MysqlConf;

const typeOrmConfig: ConnectionOptions = {
    type: 'mysql',
    "database": mysqlConf.database,
    "host": mysqlConf.host,
    "port": mysqlConf.port,
    "username": mysqlConf.user,
    "password": mysqlConf.password,
    "timezone": mysqlConf.timezone,
    "cli": {
        "migrationsDir": mysqlConf.migrationsDir
    },
    "synchronize": mysqlConf.synchronize,
    "migrationsRun": true,
    "migrations": ["migrations/mysql/{*.ts,*.js}"]
}

export = typeOrmConfig;