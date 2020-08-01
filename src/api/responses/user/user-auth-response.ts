import {ApiProperty} from '@nestjs/swagger';
import {AuthEntity, AuthTokenType} from "../../../entities/auth/auth-entity";
import {UserEntity} from "../../../entities/user/user-entity";

export class UserAuthResponse {
    @ApiProperty({
        type: String
    })
    public token: string = '';
    @ApiProperty({
        type: Number
    })
    public expired_date: number = 0;
    @ApiProperty({
        enum: AuthTokenType
    })
    public type: AuthTokenType = AuthTokenType.TEMPORARY;

    static createFromEntity(user: AuthEntity): UserAuthResponse {
        let response = new UserAuthResponse();
        response.token = user.token;
        response.expired_date = user.expire_date ? + user.expire_date : 0;
        response.type = user.type;
        return response;
    }
}