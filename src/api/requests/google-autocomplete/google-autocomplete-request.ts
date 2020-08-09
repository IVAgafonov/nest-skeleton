import {ApiProperty} from "@nestjs/swagger";

export class GoogleAutocompleteRequest {
    @ApiProperty({
        type: [String],
        example: [
            'buy car',
            'buy apartment',
            'pizza delivery'
        ]
    })
    public keywords: string[] = [];

    @ApiProperty({
        type: String,
        example: 'en_US'
    })
    public lang: string = 'en_US';

    @ApiProperty({
        type: Number,
        example: 1
    })
    public deep: number = 1;
}