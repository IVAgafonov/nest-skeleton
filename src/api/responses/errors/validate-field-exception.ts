import { HttpException } from '@nestjs/common';

export class ValidateFieldException extends HttpException {
    field: string = ""
    message: string = ""

    constructor(field: string, message: string = "Invalid value") {
        super("Invalid value", 400);
        this.field = field;
        this.message = message;
    }
}