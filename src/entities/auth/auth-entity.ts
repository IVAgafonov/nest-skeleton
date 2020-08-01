import {AbstractEntity} from "../abstract-entity";

export enum AuthTokenType {
    PERMANENT = 'PERMANENT',
    TEMPORARY = 'TEMPORARY'
}

export class AuthEntity extends AbstractEntity {
    token: string = '';
    user_id: number = 0;
    create_date: Date | null = null;
    expire_date: Date | null = null;
    type: AuthTokenType = AuthTokenType.PERMANENT;
}