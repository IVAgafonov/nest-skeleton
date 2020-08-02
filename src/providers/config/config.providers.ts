import config from "config";
import {MysqlConfig} from "../../entities/configs/mysql-config";
import {AppConfig} from "../../entities/configs/app-config";
import {CryptoConfig} from "../../entities/configs/crypto-config";
import {RedisConfig} from "../../entities/configs/redis-config";

export const APP_CONF = 'APP_CONF'
export const CRYPTO_CONF = 'CRYPTO_CONF'
export const MYSQL_MAIN_CONF = 'MYSQL_MAIN_CONF'
export const REDIS_MAIN_CONF = 'REDIS_MAIN_CONF'

export const configProviders = [
    {
        provide: MYSQL_MAIN_CONF,
        useValue:  config.get<MysqlConfig>("mysql") as MysqlConfig
    }, {
        provide: APP_CONF,
        useValue:  config.get<AppConfig>("app") as AppConfig
    }, {
        provide: CRYPTO_CONF,
        useValue:  config.get<CryptoConfig>("crypto") as CryptoConfig
    }, {
        provide: REDIS_MAIN_CONF,
        useValue: config.get<RedisConfig>("redis") as RedisConfig
    }
];
