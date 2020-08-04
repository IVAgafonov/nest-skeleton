import "reflect-metadata";
import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import config from "config";
import {NestExpressApplication} from "@nestjs/platform-express";
import {ValidationPipe} from "@nestjs/common";
import bodyParser from "body-parser";
import {MicroserviceOptions, Transport} from "@nestjs/microservices"

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.use(bodyParser.json({limit: 3 * 1024 * 1024}));
    app.use(bodyParser.urlencoded({extended: true}));
    //app.useLogger(app.get(Log4jsService));
    app.useGlobalPipes(new ValidationPipe());

    app.disable('x-powered-by');
    app.disable('etag');

    const options = new DocumentBuilder()
        .setTitle('Nest skeleton service')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
    app.startAllMicroservicesAsync();
    await app.listen(config.get<number>('app.apiPort'));
}

bootstrap();
