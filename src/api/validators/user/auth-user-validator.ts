import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import {ValidateFieldException} from "../../responses/errors/validate-field-exception";
import {ValidateFieldExceptions} from "../../responses/errors/validate-field-exceptions";
import {UserAuthRequest} from "../../requests/user/user-auth-request";
import {AuthTokenType} from "../../../entities/auth/auth-entity";

@Injectable()
export class AuthUserValidator implements PipeTransform {
    transform(value: UserAuthRequest, metadata: ArgumentMetadata) {
        const errors: ValidateFieldException[] = [];
        if (!value.email || !value.email.match(/\w+@\w+\.\w+/)) {
            errors.push(new ValidateFieldException('email', 'Invalid email'));
        }
        if (!value.password || value.password.length < 3 || value.password.length > 64) {
            errors.push(new ValidateFieldException('password', 'Invalid password'));
        }
        if (errors.length) {
            throw new ValidateFieldExceptions(errors);
        }
        value.type = value.type || AuthTokenType.TEMPORARY;
        return value;
    }
}