import { HttpException } from '@nestjs/common';
import {ValidateFieldException} from "./validate-field-exception";

export class ValidateFieldExceptions extends HttpException {
    errors: ValidateFieldException[] = []

    constructor(errors: ValidateFieldException[] = []) {
        super("Errors", 400);
        this.errors = errors;
    }
}
