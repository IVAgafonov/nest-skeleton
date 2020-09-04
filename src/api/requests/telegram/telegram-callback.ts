import {ApiProperty} from "@nestjs/swagger";

export class TelegramFrom {
    public id: number = 1;
    public is_bot: boolean = false;
    public first_name: string = 'Name';
    public last_name: string = 'Surname';
    public username: string = 'login';
    public language_code: string = 'ru';
}

export class TelegramMessage {
    public message_id: number = 1;
}

export class TelegramCallback {

    @ApiProperty({
        type: Number,
        example: 1
    })
    public update_id: number = 1;

    @ApiProperty({
        type: String,
        example: 'IGNORE'
    })
    public data: string = 'IGNORE';

    @ApiProperty({
        type: Object,
        example: {
            id: 1,
            is_bot: false,
            first_name: 'Name',
            last_name: 'Surname',
            username: 'login',
            language_code: 'ru'
        }
    })
    public from: TelegramFrom = new TelegramFrom();

    @ApiProperty({
        type: Object,
        example: {
            message_id: 1,
        }
    })
    public message: TelegramMessage = new TelegramMessage();
}