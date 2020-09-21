import {AbstractEntity} from '../abstract-entity';
import {UserGroup} from "./user-entity";

export class UserUpdateEntity extends AbstractEntity {
    id: number = 0;
    name: string = '';
    password: string = '';
    groups: UserGroup[] = [];
}