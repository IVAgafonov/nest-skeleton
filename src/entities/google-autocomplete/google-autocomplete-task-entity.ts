
export class GoogleAutocompleteTaskEntity {
    keywords: string[] = [];
    lang: string = 'en_US';
    deep: number = 1;
    constructor(keywords: string[], lang: string, deep: number = 1) {
        this.keywords = keywords;
        this.lang = lang;
        this.deep = deep;
    }
}