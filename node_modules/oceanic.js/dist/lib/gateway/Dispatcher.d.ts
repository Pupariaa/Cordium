/** @module Dispatcher */
import type Shard from "./Shard";
import type ShardManager from "./ShardManager";
import type { AnyDispatchPacket } from "../types/gateway-raw";
export type DispatchEvent = AnyDispatchPacket["t"];
export type DispatchEventMap = {
    [K in AnyDispatchPacket as K["t"]]: K["d"];
};
export type DispatchFunction<K extends DispatchEvent = DispatchEvent> = (data: DispatchEventMap[K], shard: Shard) => void;
export default class Dispatcher {
    private manager;
    events: Map<DispatchEvent, Array<DispatchFunction>>;
    constructor(manager: ShardManager);
    private handle;
    register<K extends DispatchEvent>(event: K, fn: DispatchFunction<K>, replace?: boolean): void;
    unregister<K extends DispatchEvent>(event: K, fn?: DispatchFunction<K>): void;
}
