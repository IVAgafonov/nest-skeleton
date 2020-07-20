import config from "config";
import {MysqlConf} from "../../entities/configs/mysql-config";

export const APP_CONF = 'APP_CONF'
export const CRYPTO_CONF = 'CRYPTO_CONF'
export const MYSQL_MAIN_CONF = 'MYSQL_MAIN_CONF'

export const configProviders = [{
        provide: MYSQL_MAIN_CONF,
        useValue:  config.get<MysqlConf>("mysql") as MysqlConf
    }, {
        provide: APP_CONF,
        useValue:  config.get<MysqlConf>("app") as MysqlConf
    },{
        provide: CRYPTO_CONF,
        useValue:  config.get<MysqlConf>("crypto") as MysqlConf
    }];
