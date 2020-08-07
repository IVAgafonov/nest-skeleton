import { ApiProperty } from '@nestjs/swagger';
import {UserGroup, UserEntity} from "../../../entities/user/user-entity";

export class UserResponse {
    @ApiProperty({
        type: Number
    })
    public id: number = 0;
    @ApiProperty({
        type: String
    })
    public email: string = '';
    @ApiProperty({
        type: String
    })
    public name: string = '';
    @ApiProperty({
        enum: UserGroup, isArray: true
    })
    public groups: UserGroup[] = [];
    @ApiProperty({
        type: Number
    })
    public create_date: number = 0;

    static createFromEntity(user: UserEntity): UserResponse {
        let response = new UserResponse();
        response.id = user.id;
        response.name = user.name;
        response.email = user.email;
        response.groups = user.groups;
        response.create_date = user.create_date ? + user.create_date : 0
        return response;
    }
}