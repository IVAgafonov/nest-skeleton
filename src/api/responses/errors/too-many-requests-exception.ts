import { HttpException } from '@nestjs/common';

export class TooManyRequestsException extends HttpException {
    message: string = ""

    constructor(message: string = "Bad request") {
        super("Too many requests", 429);
        this.message = message;
    }
}