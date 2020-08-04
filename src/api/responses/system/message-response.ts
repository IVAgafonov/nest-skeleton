import { HttpException } from '@nestjs/common';

export class MessageResponse {
    message: string = ""

    constructor(message: string = "") {
        this.message = message;
    }
}