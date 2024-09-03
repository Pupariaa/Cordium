/** @module OAuthGuild */
import Base from "./Base";
import Permission from "./Permission";
import type Guild from "./Guild";
import type { GuildFeature, ImageFormat } from "../Constants";
import type { JSONOAuthGuild, RawOAuthGuild } from "../types";
import type Client from "../Client";
/** Represents a guild retrieved via oauth. */
export default class OAuthGuild extends Base {
    private _cachedCompleteGuild?;
    /** The approximate number of members in this guild (if retrieved with counts). */
    approximateMemberCount?: number;
    /** The approximate number of non-offline members in this guild (if retrieved with counts). */
    approximatePresenceCount?: number;
    /** The hash of this guild's banner. */
    banner: string | null;
    /** The [features](https://discord.com/developers/docs/resources/guild#guild-object-guild-features) this guild has. */
    features: Array<GuildFeature>;
    /** The icon hash of this guild. */
    icon: string | null;
    /** The name of this guild. */
    name: string;
    /** If the user is the owner of this guild. */
    owner: boolean;
    /** The permissions of the user in this guild. */
    permissions: Permission;
    constructor(data: RawOAuthGuild, client: Client);
    /** The complete guild this OAuthGuild represents, if cached. */
    get completeGuild(): Guild | undefined;
    /**
     * The url of this guild's banner.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    bannerURL(format?: ImageFormat, size?: number): string | null;
    /**
     * The url of this guild's icon.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    iconURL(format?: ImageFormat, size?: number): string | null;
    toJSON(): JSONOAuthGuild;
}
