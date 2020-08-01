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

@Module({
    controllers: [
        UserController,
        PrometheusController
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
    }],
    imports: [
        DbModule
    ]
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(GlobalMiddleware).forRoutes({
            path: '*', method: RequestMethod.ALL
        });
    }
}
