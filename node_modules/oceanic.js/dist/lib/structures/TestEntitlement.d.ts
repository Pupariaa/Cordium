import BaseEntitlement from "./BaseEntitlement";
import type Client from "../Client";
import type { JSONTestEntitlement, RawTestEntitlement } from "../types";
/** Represents a test entitlement. */
export default class TestEntitlement extends BaseEntitlement {
    constructor(data: RawTestEntitlement, client: Client);
    /** Delete this entitlement. */
    delete(): Promise<void>;
    toJSON(): JSONTestEntitlement;
}
