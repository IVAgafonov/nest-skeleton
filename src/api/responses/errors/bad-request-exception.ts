import { HttpException } from '@nestjs/common';

export class BadRequestException extends HttpException {
    message: string = ""

    constructor(message: string = "Bad request") {
        super("Bad request", 400);
        this.message = message;
    }
}