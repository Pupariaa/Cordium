/** @module SimpleCollection */
import Collection from "./Collection";
/** This is an internal class, you should not use it in your projects. If you want a collection type for your own projects, look at {@link Collection}. */
export default class SimpleCollection<K extends string | number, M extends Record<string, any>, C extends Record<string, any> & Record<Key, K>, Key extends string = "id"> extends Collection<K, C> {
    private conversionFunc;
    protected key: Key;
    protected onDuplicate: "merge" | "throw" | "replace" | "update";
    limit: number;
    constructor(conversionFunc: (data: M) => C, limit?: number, onDuplicate?: "merge" | "throw" | "replace" | "update", key?: Key);
    add<T extends C>(value: T): T;
    update(value: M): C;
}
