import { HttpException } from '@nestjs/common';
import {ApiProperty} from "@nestjs/swagger";

export class MessageResponse {
    @ApiProperty({
        type: String
    })
    message: string = ""

    constructor(message: string = "") {
        this.message = message;
    }
}