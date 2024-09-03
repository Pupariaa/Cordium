"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ThreadableChannel_1 = tslib_1.__importDefault(require("./ThreadableChannel"));
const Constants_1 = require("../Constants");
/** Represents a guild text channel. */
class TextChannel extends ThreadableChannel_1.default {
    constructor(data, client) {
        super(data, client);
    }
    /**
     * Convert this text channel to a announcement channel.
     */
    async convert() {
        return this.client.rest.channels.edit(this.id, { type: Constants_1.ChannelTypes.GUILD_ANNOUNCEMENT });
    }
    /**
     * Follow an announcement channel to this channel.
     * @param webhookChannelID The ID of the channel to follow the announcement channel to.
     * @param reason The reason for following the announcement channel.
     */
    async followAnnouncement(webhookChannelID, reason) {
        return this.client.rest.channels.followAnnouncement(this.id, webhookChannelID, reason);
    }
    /**
     * Get the private archived threads the current user has joined in this channel.
     * @param options The options for getting the joined private archived threads.
     */
    async getJoinedPrivateArchivedThreads(options) {
        return this.client.rest.channels.getJoinedPrivateArchivedThreads(this.id, options);
    }
    /**
     * Get the private archived threads in this channel.
     * @param options The options for getting the private archived threads.
     */
    async getPrivateArchivedThreads(options) {
        return this.client.rest.channels.getPrivateArchivedThreads(this.id, options);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            type: this.type
        };
    }
}
exports.default = TextChannel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGV4dENoYW5uZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvc3RydWN0dXJlcy9UZXh0Q2hhbm5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFJQSxvRkFBb0Q7QUFDcEQsNENBQTRDO0FBSzVDLHVDQUF1QztBQUN2QyxNQUFxQixXQUFZLFNBQVEsMkJBQTBFO0lBRS9HLFlBQVksSUFBb0IsRUFBRSxNQUFjO1FBQzVDLEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQXNCLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsd0JBQVksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7SUFDbkgsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsa0JBQWtCLENBQUMsZ0JBQXdCLEVBQUUsTUFBZTtRQUM5RCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzNGLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsK0JBQStCLENBQUMsT0FBbUM7UUFDckUsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsK0JBQStCLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLHlCQUF5QixDQUFDLE9BQW1DO1FBQy9ELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVRLE1BQU07UUFDWCxPQUFPO1lBQ0gsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2pCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtTQUNsQixDQUFDO0lBQ04sQ0FBQztDQUNKO0FBNUNELDhCQTRDQyJ9