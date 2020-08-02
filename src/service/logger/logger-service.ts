import {Injectable, Logger} from "@nestjs/common";
import { configure, Log4js } from 'log4js';

@Injectable()
export class LoggerService extends Logger {
    private logger: Log4js;

    constructor() {
        super();
        this.logger = configure('./config/log4js.json');
    }
}