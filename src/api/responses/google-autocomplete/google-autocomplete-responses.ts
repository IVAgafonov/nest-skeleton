import {GoogleAutocompleteResponse} from "./google-autocomplete-response";
import {ApiProperty} from "@nestjs/swagger";

export class GoogleAutocompleteResponses {
    @ApiProperty({
        type: [GoogleAutocompleteResponse]
    })
    items: GoogleAutocompleteResponse[] = [];
    @ApiProperty({
        type: Number
    })
    count: number = 0;
    constructor(items: GoogleAutocompleteResponse[]) {
        this.items = items;
        this.count = items.length;
    }
}