import {AbstractEntity} from '../abstract-entity';

export enum UserGroup {
    USER = "USER",
    ADMIN = "ADMIN"
}

export class UserEntity extends AbstractEntity {
    id: number = 0;
    email: string = '';
    name: string = '';
    password: string = '';
    groups: UserGroup[] = [UserGroup.USER];
    create_date: Date | null = null;
    delete_date: Date | null = null;
}