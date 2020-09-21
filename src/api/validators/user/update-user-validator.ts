import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import {UserRegisterRequest} from "../../requests/user/user-register-request";
import {ValidateFieldException} from "../../responses/errors/validate-field-exception";
import {ValidateFieldExceptions} from "../../responses/errors/validate-field-exceptions";
import {UserUpdateRequest} from "../../requests/user/user-update-request";
import {UserGroup} from "../../../entities/user/user-entity";

@Injectable()
export class UpdateUserValidator implements PipeTransform {
    transform(value: UserUpdateRequest, metadata: ArgumentMetadata) {
        const errors: ValidateFieldException[] = [];
        if (value.password && (value.password.length < 3 || value.password.length > 64)) {
            errors.push(new ValidateFieldException('password', 'Invalid password'));
        }
        if (value.name && (value.name.length < 1 || value.name.length > 32)) {
            errors.push(new ValidateFieldException('name', 'Invalid name'));
        }
        if (value.groups && value.groups.length) {
            value.groups.forEach(g => {
                if (!Object.values(UserGroup).includes(g)) {
                    errors.push(new ValidateFieldException('groups', 'Invalid group'));
                }
            })
        }
        if (errors.length) {
            throw new ValidateFieldExceptions(errors);
        }
        return value;
    }
}