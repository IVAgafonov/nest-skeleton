export class AbstractEntity {
    static fillFromObject(params?: Object) {
        const entity = new this();
        if (params) {
            for (let key in params) {
                if (entity.hasOwnProperty(key)) {
                    (<any>entity)[key] = (<any>params)[key];
                }
            }
        }
        return entity;
    }
}