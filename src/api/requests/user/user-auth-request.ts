import {ApiProperty} from '@nestjs/swagger';
import {AuthTokenType} from '../../../entities/auth/auth-entity';

export class UserAuthRequest {
    @ApiProperty({
        type: String
    })
    public email: string = '';
    @ApiProperty({
        type: String
    })
    public password: string = '';
    @ApiProperty({
        enum: AuthTokenType
    })
    public type: AuthTokenType = AuthTokenType.TEMPORARY;
}