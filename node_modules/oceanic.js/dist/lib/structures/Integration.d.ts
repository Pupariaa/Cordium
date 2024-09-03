/** @module Integration */
import Base from "./Base";
import PartialApplication from "./PartialApplication";
import type User from "./User";
import type Guild from "./Guild";
import type Role from "./Role";
import type { IntegrationAccount, RawIntegration } from "../types/guilds";
import type { IntegrationExpireBehaviors, IntegrationType } from "../Constants";
import type Client from "../Client";
import type { JSONIntegration } from "../types/json";
/** Represents a guild integration. */
export default class Integration extends Base {
    private _cachedGuild?;
    private _cachedRole?;
    /** The account information associated with this integration. */
    account: IntegrationAccount;
    /** The application associated with this integration. */
    application: PartialApplication | null;
    /** If emoticons should be synced for this integration. */
    enableEmoticons: boolean;
    /** If this integration is enabled. */
    enabled: boolean;
    /** The [behavior](https://discord.com/developers/docs/resources/guild#integration-object-integration-expire-behaviors) of expiring subscribers. */
    expireBehavior?: IntegrationExpireBehaviors;
    /** The grace period (in days) before expiring subscribers. */
    expireGracePeriod?: number;
    /** The ID of the guild this integration belongs to, if applicable. */
    guildID: string | null;
    /** The name of the integration. */
    name: string;
    /** If this integration has been revoked. */
    revoked: boolean;
    /** The id of the role this integration uses for subscribers, if any. */
    roleID: string | null;
    /** The scopes the application associated with this integration has been authorized for. */
    scopes?: Array<string>;
    /** The number of subscribers this integration has. */
    subscriberCount?: number;
    /** The last date at which this integration was synced at. */
    syncedAt?: Date;
    /** If this integration is syncing. */
    syncing: boolean;
    /** The type of integration. */
    type: IntegrationType;
    /** The user associated with this integration, if applicable. */
    user?: User;
    constructor(data: RawIntegration, client: Client, guildID?: string);
    protected update(data: Partial<RawIntegration>): void;
    /** The guild this integration belongs to, if applicable. This will throw an error if the guild is not cached. */
    get guild(): Guild | null;
    /** The role this integration uses for subscribers, if any. */
    get role(): Role | null | undefined;
    toJSON(): JSONIntegration;
}
