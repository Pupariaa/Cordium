"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ThreadableChannel_1 = tslib_1.__importDefault(require("./ThreadableChannel"));
const Constants_1 = require("../Constants");
/**
 * Represents a guild announcement channel.
 * @mergeTarget AnnouncementChannel
 */
class AnnouncementChannel extends ThreadableChannel_1.default {
    constructor(data, client) {
        super(data, client);
        this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
    }
    get parent() {
        return super.parent;
    }
    /**
     * Convert this announcement channel to a text channel.
     */
    async convert() {
        return this.client.rest.channels.edit(this.id, { type: Constants_1.ChannelTypes.GUILD_TEXT });
    }
    /**
     * Crosspost a message in this channel.
     * @param messageID The ID of the message to crosspost.
     */
    async crosspostMessage(messageID) {
        return this.client.rest.channels.crosspostMessage(this.id, messageID);
    }
    /**
     * Follow this announcement channel.
     * @param webhookChannelID The ID of the channel crossposted messages should be sent to. The client must have the `MANAGE_WEBHOOKS` permission in this channel.
     * @param reason The reason for following this channel.
     */
    async follow(webhookChannelID, reason) {
        return this.client.rest.channels.followAnnouncement(this.id, webhookChannelID, reason);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            rateLimitPerUser: 0,
            type: this.type
        };
    }
}
exports.default = AnnouncementChannel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5ub3VuY2VtZW50Q2hhbm5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zdHJ1Y3R1cmVzL0Fubm91bmNlbWVudENoYW5uZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBS0Esb0ZBQW9EO0FBQ3BELDRDQUE0QztBQUs1Qzs7O0dBR0c7QUFDSCxNQUFxQixtQkFBb0IsU0FBUSwyQkFBaUU7SUFJOUcsWUFBWSxJQUE0QixFQUFFLE1BQWM7UUFDcEQsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDLDZCQUE2QixDQUFDO0lBQ3pFLENBQUM7SUFFRCxJQUFhLE1BQU07UUFDZixPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDeEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQWMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSx3QkFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDbkcsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFpQjtRQUNwQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBTyxJQUFJLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLE1BQU0sQ0FBQyxnQkFBd0IsRUFBRSxNQUFlO1FBQ2xELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDM0YsQ0FBQztJQUVRLE1BQU07UUFDWCxPQUFPO1lBQ0gsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2pCLGdCQUFnQixFQUFFLENBQUM7WUFDbkIsSUFBSSxFQUFjLElBQUksQ0FBQyxJQUFJO1NBQzlCLENBQUM7SUFDTixDQUFDO0NBQ0o7QUE1Q0Qsc0NBNENDIn0=