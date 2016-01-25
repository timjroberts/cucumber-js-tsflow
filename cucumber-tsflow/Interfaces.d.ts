declare interface IDictionary<TValue> {
    [key: string]: TValue;
}

declare interface IMetaDictionary<TValue> extends IDictionary<TValue> {
    meta: any;
}
