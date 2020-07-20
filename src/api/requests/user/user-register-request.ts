import { ApiProperty } from '@nestjs/swagger';

export class UserRegisterRequest {
    @ApiProperty({
        type: String
    })
    public email: string = '';
    @ApiProperty({
        type: String
    })
    public name: string = '';
    @ApiProperty({
        type: String
    })
    public password: string = '';
}