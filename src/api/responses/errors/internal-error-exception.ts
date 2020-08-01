import { HttpException } from '@nestjs/common';

export class InternalErrorException extends HttpException {
    message: string = ""

    constructor(message: string = "Internal server error") {
        super("Internal server error", 500);
        this.message = message;
    }
}