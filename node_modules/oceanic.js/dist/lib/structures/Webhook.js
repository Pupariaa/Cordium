"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module Webhook */
const Base_1 = tslib_1.__importDefault(require("./Base"));
const Constants_1 = require("../Constants");
const Routes = tslib_1.__importStar(require("../util/Routes"));
const Errors_1 = require("../util/Errors");
/** Represents a webhook. */
class Webhook extends Base_1.default {
    _cachedChannel;
    _cachedGuild;
    /** The application associated with this webhook. */
    application;
    /** The ID of the application associated with this webhook. */
    applicationID;
    /** The hash of this webhook's avatar. */
    avatar;
    /** The ID of the channel this webhook is for, if applicable. */
    channelID;
    /** The id of the guild this webhook is in, if applicable. */
    guildID;
    /** The username of this webhook, if any. */
    name;
    /** The source channel for this webhook (channel follower only). */
    sourceChannel;
    /** The source guild for this webhook (channel follower only). */
    sourceGuild;
    /** The token for this webhook (not present for webhooks created by other applications) */
    token;
    /** The [type](https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-types) of this webhook. */
    type;
    /** The user that created this webhook. */
    user;
    constructor(data, client) {
        super(data.id, client);
        this.application = (!client["_application"] || data.application_id === null) ? null : (client.application.id === data.application_id ? client.application : undefined);
        this.applicationID = data.application_id;
        this.avatar = data.avatar ?? null;
        this.channelID = data.channel_id;
        this.guildID = data.guild_id ?? null;
        this.name = data.name;
        this.sourceChannel = data.source_channel;
        this.sourceGuild = data.source_guild;
        this.token = data.token;
        this.type = data.type;
        this.user = data.user === undefined ? null : client.users.update(data.user);
    }
    /** The channel this webhook is for, if applicable. */
    get channel() {
        if (this.channelID !== null && this._cachedChannel !== null) {
            return this._cachedChannel ?? (this._cachedChannel = this.client.getChannel(this.channelID));
        }
        return this._cachedChannel === null ? this._cachedChannel : (this._cachedChannel = null);
    }
    /** The guild this webhook is for, if applicable. This will throw an error if the guild is not cached. */
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
    get url() {
        return `${Constants_1.API_URL}${Routes.WEBHOOK(this.id, this.token)}`;
    }
    /**
     * The url of this webhook's avatar.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    avatarURL(format, size) {
        return this.avatar === null ? null : this.client.util.formatImage(Routes.USER_AVATAR(this.id, this.avatar), format, size);
    }
    /**
     * Delete this webhook (requires a bot user, see `deleteToken`).
     * @param reason The reason for deleting this webhook.
     */
    async delete(reason) {
        return this.client.rest.webhooks.delete(this.id, reason);
    }
    /**
     * Delete a message from this webhook.
     * @param messageID The ID of the message.
     * @param options The options for deleting the message.
     * @param token The token for the webhook, if not already present.
     */
    async deleteMessage(messageID, options, token) {
        const t = this.token ?? token;
        if (!t) {
            throw new TypeError("Token is not present on webhook, and was not provided in options.");
        }
        return this.client.rest.webhooks.deleteMessage(this.id, t, messageID, options);
    }
    /**
     * Delete this webhook via its token.
     * @param token The token for the webhook, if not already present.
     */
    async deleteToken(token) {
        const t = this.token ?? token;
        if (!t) {
            throw new TypeError("Token is not present on webhook, and was not provided in options.");
        }
        return this.client.rest.webhooks.deleteToken(this.id, t);
    }
    /**
     * Edit this webhook (requires a bot user, see `editToken`).
     * @param options The options for editing the webhook.
     */
    async edit(options) {
        return this.client.rest.webhooks.edit(this.id, options);
    }
    /**
     * Edit a webhook message.
     * @param messageID The ID of the message to edit.
     * @param token The token of the webhook.
     * @param options The options for editing the message.
     */
    async editMessage(messageID, options, token) {
        const t = this.token ?? token;
        if (!t) {
            throw new TypeError("Token is not present on webhook, and was not provided in options.");
        }
        return this.client.rest.webhooks.editMessage(this.id, t, messageID, options);
    }
    /**
     * Edit a webhook via its token.
     * @param options The options for editing the webhook.
     * @param token The token for the webhook, if not already present.
     */
    async editToken(options, token) {
        const t = this.token ?? token;
        if (!t) {
            throw new TypeError("Token is not present on webhook, and was not provided in options.");
        }
        return this.client.rest.webhooks.editToken(this.id, t, options);
    }
    async execute(options, token) {
        const t = this.token ?? token;
        if (!t) {
            throw new TypeError("Token is not present on webhook, and was not provided in options.");
        }
        return this.client.rest.webhooks.execute(this.id, t, options);
    }
    async executeGithub(options, token) {
        const t = this.token ?? token;
        if (!t) {
            throw new TypeError("Token is not present on webhook, and was not provided in options.");
        }
        return this.client.rest.webhooks.executeGithub(this.id, t, options);
    }
    async executeSlack(options, token) {
        const t = this.token ?? token;
        if (!t) {
            throw new TypeError("Token is not present on webhook, and was not provided in options.");
        }
        return this.client.rest.webhooks.executeSlack(this.id, t, options);
    }
    /**
     * Get a webhook message.
     * @param messageID The ID of the message.
     * @param threadID The ID of the thread the message is in.
     * @param token The token for the webhook, if not already present.
     */
    async getMessage(messageID, threadID, token) {
        const t = this.token ?? token;
        if (!t) {
            throw new TypeError("Token is not present on webhook, and was not provided in options.");
        }
        return this.client.rest.webhooks.getMessage(this.id, t, messageID, threadID);
    }
    /**
     * The url of this webhook's `sourceGuild` icon (only present on channel follower webhooks).
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    sourceGuildIconURL(format, size) {
        return this.sourceGuild?.icon ? this.client.util.formatImage(Routes.GUILD_ICON(this.id, this.sourceGuild?.icon), format, size) : null;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            applicationID: this.applicationID,
            avatar: this.avatar,
            channelID: this.channelID ?? null,
            guildID: this.guildID,
            name: this.name,
            sourceChannel: this.sourceChannel,
            sourceGuild: this.sourceGuild,
            token: this.token,
            type: this.type,
            user: this.user?.toJSON()
        };
    }
}
exports.default = Webhook;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2ViaG9vay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zdHJ1Y3R1cmVzL1dlYmhvb2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsc0JBQXNCO0FBQ3RCLDBEQUEwQjtBQU0xQiw0Q0FBNEU7QUFDNUUsK0RBQXlDO0FBWXpDLDJDQUErQztBQUUvQyw0QkFBNEI7QUFDNUIsTUFBcUIsT0FBUSxTQUFRLGNBQUk7SUFDN0IsY0FBYyxDQUFrQztJQUNoRCxZQUFZLENBQWdCO0lBQ3BDLG9EQUFvRDtJQUNwRCxXQUFXLENBQTRCO0lBQ3ZDLDhEQUE4RDtJQUM5RCxhQUFhLENBQWdCO0lBQzdCLHlDQUF5QztJQUN6QyxNQUFNLENBQWdCO0lBQ3RCLGdFQUFnRTtJQUNoRSxTQUFTLENBQWdCO0lBQ3pCLDZEQUE2RDtJQUM3RCxPQUFPLENBQWdCO0lBQ3ZCLDRDQUE0QztJQUM1QyxJQUFJLENBQWdCO0lBQ3BCLG1FQUFtRTtJQUNuRSxhQUFhLENBQW1DO0lBQ2hELGlFQUFpRTtJQUNqRSxXQUFXLENBQTBDO0lBQ3JELDBGQUEwRjtJQUMxRixLQUFLLENBQVU7SUFDZixzSEFBc0g7SUFDdEgsSUFBSSxDQUFlO0lBQ25CLDBDQUEwQztJQUMxQyxJQUFJLENBQWM7SUFDbEIsWUFBWSxJQUFnQixFQUFFLE1BQWM7UUFDeEMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLElBQUksQ0FBQyxjQUFjLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FB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