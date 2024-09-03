"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module Integration */
const Base_1 = tslib_1.__importDefault(require("./Base"));
const PartialApplication_1 = tslib_1.__importDefault(require("./PartialApplication"));
const Errors_1 = require("../util/Errors");
/** Represents a guild integration. */
class Integration extends Base_1.default {
    _cachedGuild;
    _cachedRole;
    /** The account information associated with this integration. */
    account;
    /** The application associated with this integration. */
    application;
    /** If emoticons should be synced for this integration. */
    enableEmoticons;
    /** If this integration is enabled. */
    enabled;
    /** The [behavior](https://discord.com/developers/docs/resources/guild#integration-object-integration-expire-behaviors) of expiring subscribers. */
    expireBehavior;
    /** The grace period (in days) before expiring subscribers. */
    expireGracePeriod;
    /** The ID of the guild this integration belongs to, if applicable. */
    guildID;
    /** The name of the integration. */
    name;
    /** If this integration has been revoked. */
    revoked;
    /** The id of the role this integration uses for subscribers, if any. */
    roleID;
    /** The scopes the application associated with this integration has been authorized for. */
    scopes;
    /** The number of subscribers this integration has. */
    subscriberCount;
    /** The last date at which this integration was synced at. */
    syncedAt;
    /** If this integration is syncing. */
    syncing;
    /** The type of integration. */
    type;
    /** The user associated with this integration, if applicable. */
    user;
    constructor(data, client, guildID) {
        super(data.id, client);
        this.account = data.account;
        this.application = null;
        this.enableEmoticons = !!data.enable_emoticons;
        this.enabled = !!data.enabled;
        this.guildID = guildID === undefined ? null : guildID;
        this.name = data.name;
        this.revoked = !!data.revoked;
        this.roleID = data.role_id === undefined ? null : data.role_id;
        this.syncing = !!data.syncing;
        this.type = data.type;
        this.update(data);
    }
    update(data) {
        if (data.account !== undefined) {
            this.account = data.account;
        }
        if (data.application !== undefined) {
            this.application = new PartialApplication_1.default(data.application, this.client);
        }
        if (data.enable_emoticons !== undefined) {
            this.enableEmoticons = data.enable_emoticons;
        }
        if (data.enabled !== undefined) {
            this.enabled = data.enabled;
        }
        if (data.expire_behavior !== undefined) {
            this.expireBehavior = data.expire_behavior;
        }
        if (data.expire_grace_period !== undefined) {
            this.expireGracePeriod = data.expire_grace_period;
        }
        if (data.name !== undefined) {
            this.name = data.name;
        }
        if (data.revoked !== undefined) {
            this.revoked = data.revoked;
        }
        if (data.role_id !== undefined) {
            this.roleID = data.role_id;
        }
        if (data.scopes !== undefined) {
            this.scopes = data.scopes;
        }
        if (data.subscriber_count !== undefined) {
            this.subscriberCount = data.subscriber_count;
        }
        if (data.synced_at !== undefined) {
            this.syncedAt = new Date(data.synced_at);
        }
        if (data.syncing !== undefined) {
            this.syncing = data.syncing;
        }
        if (data.type !== undefined) {
            this.type = data.type;
        }
        if (data.user !== undefined) {
            this.user = this.client.users.update(data.user);
        }
    }
    /** The guild this integration belongs to, if applicable. This will throw an error if the guild is not cached. */
    get guild() {
        if (this.guildID !== null && this._cachedGuild !== null) {
            this._cachedGuild ??= this.client.guilds.get(this.guildID);
            if (!this._cachedGuild) {
                if (this.client.options.restMode) {
                    throw new Errors_1.UncachedError(`${this.constructor.name}#guild is not present when rest mode is enabled.`);
                }
                if (!this.client.shards.connected) {
                    throw new Errors_1.UncachedError(`${this.constructor.name}#guild is not present without a gateway connection.`);
                }
                throw new Errors_1.UncachedError(`${this.constructor.name}#guild is not present.`);
            }
            return this._cachedGuild;
        }
        return this._cachedGuild === null ? this._cachedGuild : (this._cachedGuild = null);
    }
    /** The role this integration uses for subscribers, if any. */
    get role() {
        if (this.roleID !== null && this._cachedRole !== null) {
            try {
                return this._cachedRole ?? (this._cachedRole = this.guild?.roles.get(this.roleID));
            }
            catch {
                return (this._cachedRole = undefined);
            }
        }
        return this._cachedRole === null ? this._cachedRole : (this._cachedRole = null);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            account: this.account,
            application: this.application?.toJSON(),
            enableEmoticons: this.enableEmoticons,
            enabled: this.enabled,
            expireBehavior: this.expireBehavior,
            expireGracePeriod: this.expireGracePeriod,
            name: this.name,
            revoked: this.revoked,
            roleID: this.roleID,
            scopes: this.scopes,
            subscriberCount: this.subscriberCount,
            syncedAt: this.syncedAt?.getTime(),
            syncing: this.syncing,
            type: this.type,
            user: this.user?.toJSON()
        };
    }
}
exports.default = Integration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZWdyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvc3RydWN0dXJlcy9JbnRlZ3JhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQkFBMEI7QUFDMUIsMERBQTBCO0FBQzFCLHNGQUFzRDtBQVF0RCwyQ0FBK0M7QUFFL0Msc0NBQXNDO0FBQ3RDLE1BQXFCLFdBQVksU0FBUSxjQUFJO0lBQ2pDLFlBQVksQ0FBZ0I7SUFDNUIsV0FBVyxDQUFlO0lBQ2xDLGdFQUFnRTtJQUNoRSxPQUFPLENBQXFCO0lBQzVCLHdEQUF3RDtJQUN4RCxXQUFXLENBQTRCO0lBQ3ZDLDBEQUEwRDtJQUMxRCxlQUFlLENBQVU7SUFDekIsc0NBQXNDO0lBQ3RDLE9BQU8sQ0FBVTtJQUNqQixtSkFBbUo7SUFDbkosY0FBYyxDQUE4QjtJQUM1Qyw4REFBOEQ7SUFDOUQsaUJBQWlCLENBQVU7SUFDM0Isc0VBQXNFO0lBQ3RFLE9BQU8sQ0FBZ0I7SUFDdkIsbUNBQW1DO0lBQ25DLElBQUksQ0FBUztJQUNiLDRDQUE0QztJQUM1QyxPQUFPLENBQVU7SUFDakIsd0VBQXdFO0lBQ3hFLE1BQU0sQ0FBZ0I7SUFDdEIsMkZBQTJGO0lBQzNGLE1BQU0sQ0FBaUI7SUFDdkIsc0RBQXNEO0lBQ3RELGVBQWUsQ0FBVTtJQUN6Qiw2REFBNkQ7SUFDN0QsUUFBUSxDQUFRO0lBQ2hCLHNDQUFzQztJQUN0QyxPQUFPLENBQVU7SUFDakIsK0JBQStCO0lBQy9CLElBQUksQ0FBa0I7SUFDdEIsZ0VBQWdFO0lBQ2hFLElBQUksQ0FBUTtJQUNaLFlBQVksSUFBb0IsRUFBRSxNQUFjLEVBQUUsT0FBZ0I7UUFDOUQsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzVCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FB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