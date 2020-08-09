
export class GoogleAutocompleteTaskEntity {
    keyword: string = '';
    lang: string = 'en_US';
    deep: number = 1;
    constructor(keywords: string, lang: string, deep: number = 1) {
        this.keyword = keywords;
        this.lang = lang;
        this.deep = deep;
    }
}