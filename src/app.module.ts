import {Module, NestModule, MiddlewareConsumer, RequestMethod} from "@nestjs/common";
import {DbModule} from "./providers/db/db.module";
import {APP_FILTER, APP_INTERCEPTOR} from "@nestjs/core";
import {ErrorsModule, LogModule, MetricsInterceptor, MetricsModule} from "@promonavi/baseservice";
import {BullModule} from "@nestjs/bull";
import {UserController} from "./api/controllers/user-controller";
import { TypeOrmModule } from '@nestjs/typeorm';
import {GlobalHttpFilter} from "./api/filters/global-http-filter";
import {GlobalMiddleware} from "./api/middlewares/global-middleware";
import {UserService} from "./service/user-service";
import typeOrmConfig = require("./ormconfig");
import {CryptoService} from "./service/crypto-service";

@Module({
    controllers: [
        UserController
    ],
    providers: [{
        provide: APP_INTERCEPTOR,
        useClass: MetricsInterceptor,
    }, {
        provide: APP_FILTER,
        useClass: GlobalHttpFilter,
    }, {
        provide: UserService,
        useClass: UserService,
    }, {
        provide: CryptoService,
        useClass: CryptoService,
    }],
    imports: [
        DbModule,
        MetricsModule,
        LogModule,
        TypeOrmModule.forRoot(typeOrmConfig)
    ]
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(GlobalMiddleware).forRoutes({
            path: '*', method: RequestMethod.ALL
        });
    }
}
