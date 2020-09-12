import {Module, NestModule, MiddlewareConsumer, RequestMethod} from "@nestjs/common";
import {DbModule} from "./providers/db/db.module";
import {APP_FILTER, APP_INTERCEPTOR} from "@nestjs/core";
import {BullModule} from "@nestjs/bull";
import {UserController} from "./api/controllers/user-controller";
import {GlobalHttpFilter} from "./api/filters/global-http-filter";
import {GlobalMiddleware} from "./api/middlewares/global-middleware";
import {UserService} from "./service/user/user-service";
import {CryptoService} from "./service/crypto/crypto-service";
import {PrometheusController} from "./api/controllers/prometheus-controller";
import {PrometheusService} from "./service/prometheus/prometheus-service";
import config from "config";
import {RedisConfig} from "./entities/configs/redis-config";
import {ConfigModule} from "./providers/config/config.module";
import {REDIS_MAIN_CONF} from "./providers/config/config.providers";
import {AsyncTaskConsumer} from "./workers/AsyncTaskConsumer";
import {GoogleController} from "./api/controllers/google-controller";
import {LoggerService} from "./service/logger/logger-service";
import {doc} from "prettier";
import { join } from 'path';
import {TelegramController} from "./api/controllers/telegram-controller";
import {TelegramService} from "./service/telegram/telegram-service";
import {TelegramControllerService} from "./service/telegram/telegram-controller-service";

@Module({
    controllers: [
        UserController,
        PrometheusController,
        GoogleController,
        TelegramController
    ],
    providers: [{
        provide: APP_FILTER,
        useClass: GlobalHttpFilter,
    }, {
        provide: UserService,
        useClass: UserService,
    }, {
        provide: PrometheusService,
        useClass: PrometheusService,
    }, {
        provide: CryptoService,
        useClass: CryptoService,
    }, {
        provide: LoggerService,
        useClass: LoggerService
    }, {
        provide: TelegramService,
        useClass: TelegramService,
    }, {
        provide: TelegramControllerService,
        useClass: TelegramControllerService
    }//,
        //AsyncTaskConsumer //async process in same proc
    ],
    imports: [
        DbModule,
        BullModule.registerQueueAsync({ //async process in separated proc
            name: config.get<string>('queues.check_browser_ip'),
            imports: [ConfigModule],
            useFactory: async (redisConf: RedisConfig) => ({
                redis: redisConf,
                processors: [ {
                    path: join(__dirname, 'workers/check-browser-ip/check-browser-ip-consumer.' +
                        (process.env.NODE_ENV === 'development' ? 'ts' : 'js')),
                    concurrency: 3
                } ],
                settings: {
                    drainDelay: 0.3
                }
            }),
            inject: [REDIS_MAIN_CONF]
        }, { //async process in separated proc
            name: config.get<string>('queues.google_autocomplete_task'),
            imports: [ConfigModule],
            useFactory: async (redisConf: RedisConfig) => ({
                redis: redisConf,
                processors: [ {
                    path: join(__dirname, 'workers/google-autocomplete/google-autocomplete-consumer.' +
                        (process.env.NODE_ENV === 'development' ? 'ts' : 'js')),
                    concurrency: 3
                } ],
                settings: {
                    drainDelay: 0.3
                }
            }),
            inject: [REDIS_MAIN_CONF]
        })
    ]
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(GlobalMiddleware).forRoutes({
            path: '*', method: RequestMethod.ALL
        });
    }
}
