import {ApiProperty} from "@nestjs/swagger";

export class GoogleAutocompleteResponse {
    @ApiProperty({
        type: String
    })
    keyword: string = '';
    @ApiProperty({
        type: [String]
    })
    autocomplete: string[] = [];
    constructor(keyword: string, autocomplete: string[]) {
        this.keyword = keyword;
        this.autocomplete = autocomplete;
    }
}