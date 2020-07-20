import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import {UserRegisterRequest} from "../../requests/user/user-register-request";
import {ValidateFieldException} from "../../responses/errors/validate-field-exception";
import {ValidateFieldExceptions} from "../../responses/errors/validate-field-exceptions";

@Injectable()
export class CreateUserValidator implements PipeTransform {
    transform(value: UserRegisterRequest, metadata: ArgumentMetadata) {
        const errors: ValidateFieldException[] = [];
        if (!value.email || !value.email.match(/\w+@\w+\.\w+/)) {
            errors.push(new ValidateFieldException('email', 'Invalid email'));
        }
        if (!value.password || value.password.length < 3 || value.password.length > 64) {
            errors.push(new ValidateFieldException('password', 'Invalid password'));
        }
        if (!value.name || value.name.length < 1 || value.name.length > 32) {
            errors.push(new ValidateFieldException('name', 'Invalid name'));
        }
        if (errors.length) {
            throw new ValidateFieldExceptions(errors);
        }
        return value;
    }
}