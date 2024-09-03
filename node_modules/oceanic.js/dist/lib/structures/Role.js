"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module Role */
const Base_1 = tslib_1.__importDefault(require("./Base"));
const Permission_1 = tslib_1.__importDefault(require("./Permission"));
const Errors_1 = require("../util/Errors");
/** Represents a role in a guild. */
class Role extends Base_1.default {
    _cachedGuild;
    /** The color of this role. */
    color;
    /** The {@link Constants~RoleFlags | flags } for this role. */
    flags;
    /** The id of the guild this role is in. */
    guildID;
    /** If this role is hoisted. */
    hoist;
    /** The icon has of this role. */
    icon;
    /** If this role is managed by an integration. */
    managed;
    /** If this role can be mentioned by anybody. */
    mentionable;
    /** The name of this role. */
    name;
    /** The permissions of this role. */
    permissions;
    /** The position of this role. */
    position;
    /** The [tags](https://discord.com/developers/docs/topics/permissions#role-object-role-tags-structure) of this role. */
    tags;
    /** The unicode emoji of this role. */
    unicodeEmoji;
    constructor(data, client, guildID) {
        super(data.id, client);
        this.color = data.color;
        this.flags = data.flags;
        this.guildID = guildID;
        this.hoist = !!data.hoist;
        this.icon = null;
        this.managed = !!data.managed;
        this.mentionable = !!data.mentionable;
        this.name = data.name;
        this.permissions = new Permission_1.default(data.permissions);
        this.position = data.position;
        this.unicodeEmoji = null;
        this.update(data);
    }
    update(data) {
        if (data.flags !== undefined) {
            this.flags = data.flags;
        }
        if (data.color !== undefined) {
            this.color = data.color;
        }
        if (data.hoist !== undefined) {
            this.hoist = data.hoist;
        }
        if (data.icon !== undefined) {
            this.icon = data.icon ?? null;
        }
        if (data.mentionable !== undefined) {
            this.mentionable = data.mentionable;
        }
        if (data.name !== undefined) {
            this.name = data.name;
        }
        if (data.permissions !== undefined) {
            this.permissions = new Permission_1.default(data.permissions);
        }
        if (data.position !== undefined) {
            this.position = data.position;
        }
        if (data.unicode_emoji !== undefined) {
            this.unicodeEmoji = data.unicode_emoji ?? null;
        }
        this.tags = {
            availableForPurchase: data.tags?.available_for_purchase === null,
            guildConnections: data.tags?.guild_connections === null,
            botID: data.tags?.bot_id,
            integrationID: data.tags?.integration_id,
            premiumSubscriber: data.tags?.premium_subscriber === null,
            subscriptionListingID: data.tags?.subscription_listing_id
        };
    }
    /** The guild this role is in. This will throw an error if the guild is not cached. */
    get guild() {
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
    /** A string that will mention this role. */
    get mention() {
        return `<@&${this.id}>`;
    }
    /**
     * Delete this role.
     * @param reason The reason for deleting the role.
     */
    async delete(reason) {
        return this.client.rest.guilds.deleteRole(this.guildID, this.id, reason);
    }
    /**
     * Edit this role.
     * @param options The options for editing the role.
     */
    async edit(options) {
        return this.client.rest.guilds.editRole(this.guildID, this.id, options);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            color: this.color,
            guildID: this.guildID,
            hoist: this.hoist,
            icon: this.icon,
            managed: this.managed,
            mentionable: this.mentionable,
            name: this.name,
            permissions: this.permissions.toJSON(),
            position: this.position,
            tags: this.tags,
            unicodeEmoji: this.unicodeEmoji
        };
    }
}
exports.default = Role;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zdHJ1Y3R1cmVzL1JvbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUJBQW1CO0FBQ25CLDBEQUEwQjtBQUMxQixzRUFBc0M7QUFLdEMsMkNBQStDO0FBRS9DLG9DQUFvQztBQUNwQyxNQUFxQixJQUFLLFNBQVEsY0FBSTtJQUMxQixZQUFZLENBQVM7SUFDN0IsOEJBQThCO0lBQzlCLEtBQUssQ0FBUztJQUNkLDhEQUE4RDtJQUM5RCxLQUFLLENBQVM7SUFDZCwyQ0FBMkM7SUFDM0MsT0FBTyxDQUFTO0lBQ2hCLCtCQUErQjtJQUMvQixLQUFLLENBQVU7SUFDZixpQ0FBaUM7SUFDakMsSUFBSSxDQUFnQjtJQUNwQixpREFBaUQ7SUFDakQsT0FBTyxDQUFVO0lBQ2pCLGdEQUFnRDtJQUNoRCxXQUFXLENBQVU7SUFDckIsNkJBQTZCO0lBQzdCLElBQUksQ0FBUztJQUNiLG9DQUFvQztJQUNwQyxXQUFXLENBQWE7SUFDeEIsaUNBQWlDO0lBQ2pDLFFBQVEsQ0FBUztJQUNqQix1SEFBdUg7SUFDdkgsSUFBSSxDQUFZO0lBQ2hCLHNDQUFzQztJQUN0QyxZQUFZLENBQWdCO0lBQzVCLFlBQVksSUFBYSxFQUFFLE1BQWMsRUFBRSxPQUFlO1FBQ3RELEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN4QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDeEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsT0FBTyxH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