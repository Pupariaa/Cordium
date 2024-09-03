/// <reference types="node" />
/** @module Base */
import type Client from "../Client";
import type { JSONBase } from "../types/json";
import { inspect } from "node:util";
/** A base class which most other classes extend. */
export default abstract class Base {
    client: Client;
    id: string;
    constructor(id: string, client: Client);
    static generateID(timestamp?: number | Date): string;
    static getCreatedAt(id: string): Date;
    static getDiscordEpoch(id: string): number;
    protected update(data: unknown): void;
    get createdAt(): Date;
    /** @hidden */
    [inspect.custom](): this;
    toJSON(): JSONBase;
    toString(): string;
}
