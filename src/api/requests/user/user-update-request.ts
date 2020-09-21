import { ApiProperty } from '@nestjs/swagger';
import {UserGroup} from "../../../entities/user/user-entity";

export class UserUpdateRequest {
    @ApiProperty({
        type: String
    })
    public name: string = '';
    @ApiProperty({
        type: String
    })
    public password: string = '';
    @ApiProperty({
        enum: UserGroup, isArray: true
    })
    public groups: UserGroup[] = [];
}