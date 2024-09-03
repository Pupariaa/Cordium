import Base from "./Base";
import type { EntitlementTypes } from "../Constants";
import type { RawBaseEntitlement } from "../types/applications";
import type Client from "../Client";
import type { JSONBaseEntitlement } from "../types";
/** Represents a base entitlement. See {@link TestEntitlement | TestEntitlement} and {@link Entitlement | Entitlement}. */
export default class BaseEntitlement extends Base {
    applicationID: string;
    consumed: boolean;
    deleted: boolean;
    giftCodeFlags: number;
    guildID: string | null;
    promotionID: string | null;
    skuID: string;
    type: EntitlementTypes;
    userID: string | null;
    constructor(data: RawBaseEntitlement, client: Client);
    /** Mark this entitlement as consumed. */
    consume(): Promise<void>;
    toJSON(): JSONBaseEntitlement;
}
