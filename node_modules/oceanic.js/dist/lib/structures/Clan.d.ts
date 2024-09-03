import type Client from "../Client";
import type { ImageFormat } from "../Constants";
import type { RawClan } from "../types/users";
import type { JSONClan } from "../types";
/** Represents an invite. */
export default class Clan {
    /** The badge hash of this clan. */
    badge: string;
    client: Client;
    identityEnabled: boolean;
    identityGuildID: string;
    /** The tag of this clan, shown beside messages. */
    tag: string;
    constructor(data: RawClan, client: Client);
    protected update(data: Partial<RawClan>): void;
    /**
     * The url of this guild's icon.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    badgeURL(format?: ImageFormat, size?: number): string;
    toJSON(): JSONClan;
}
