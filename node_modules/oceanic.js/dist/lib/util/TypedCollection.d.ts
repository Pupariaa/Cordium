/** @module TypedCollection */
import Collection from "./Collection";
import type Client from "../Client";
import Base from "../structures/Base";
import type { AnyClass } from "../types/misc";
export interface ExtraOptions<M extends Record<string, any>, C extends Base, E extends Array<unknown> = []> {
    construct?(this: void, data: M, ...extra: E): C;
    delete?(this: void, key: string): void;
}
/** This is an internal class, you should not use it in your projects. If you want a collection type for your own projects, look at {@link Collection}. */
export default class TypedCollection<M extends Record<string, any>, C extends Base, E extends Array<unknown> = []> extends Collection<string, C> {
    private _baseObject;
    extraOptions: Required<ExtraOptions<M, C, E>>;
    limit: number;
    constructor(baseObject: AnyClass<M, C, E>, client: Client, limit?: number, extraOptions?: ExtraOptions<M, C, E>);
    /** @hidden */
    add<T extends C>(value: T): T;
    clear(): void;
    delete(key: string): boolean;
    /** @hidden */
    update(value: C | Partial<M> & {
        id?: string;
    }, ...extra: E): C;
}
