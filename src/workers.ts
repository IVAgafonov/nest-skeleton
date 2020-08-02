import "reflect-metadata";
import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import config from "config";
import {NestExpressApplication} from "@nestjs/platform-express";
import {ValidationPipe} from "@nestjs/common";
import bodyParser from "body-parser";
import {MicroserviceOptions, Transport} from "@nestjs/microservices"
import {getLogger} from "log4js";
import {WorkersModule} from "./app.workers";

async function bootstrap() {
    const workers = await NestFactory.create<NestExpressApplication>(WorkersModule);
    await workers.init();
}

bootstrap();
