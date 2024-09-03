/** @module InviteGuild */
import Base from "./Base";
import type Guild from "./Guild";
import type { GuildFeature, GuildNSFWLevels, ImageFormat, VerificationLevels } from "../Constants";
import type { JSONInviteGuild, RawInviteGuild } from "../types";
import type Client from "../Client";
/** Represents a guild received via an invite. */
export default class InviteGuild extends Base {
    private _cachedCompleteGuild?;
    /** The hash of this guild's banner. */
    banner: string | null;
    /** The description of this guild. */
    description: string | null;
    /** The [features](https://discord.com/developers/docs/resources/guild#guild-object-guild-features) this guild has. */
    features: Array<GuildFeature>;
    /** The icon hash of this guild. */
    icon: string | null;
    /** The name of this guild. */
    name: string;
    /** The [nsfw level](https://discord.com/developers/docs/resources/guild#guild-object-guild-nsfw-level) of this guild. */
    nsfwLevel: GuildNSFWLevels;
    /** The number of nitro boosts this guild has. */
    premiumSubscriptionCount?: number;
    /** The invite splash hash of this guild. */
    splash: string | null;
    /** The vanity url of this guild. Only present in guilds with the `VANITY_URL` feature. */
    vanityURLCode: string | null;
    /** The [verification level](https://discord.com/developers/docs/resources/guild#guild-object-verification-level) of this guild. */
    verificationLevel: VerificationLevels;
    constructor(data: RawInviteGuild, client: Client);
    /** The complete guild this InviteGuild represents, if cached. */
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
    /**
     * The url of this guild's invite splash.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    splashURL(format?: ImageFormat, size?: number): string | null;
    toJSON(): JSONInviteGuild;
}
