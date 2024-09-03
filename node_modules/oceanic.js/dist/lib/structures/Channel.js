"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module Channel */
const Base_1 = tslib_1.__importDefault(require("./Base"));
const Constants_1 = require("../Constants");
/** Represents a channel. */
class Channel extends Base_1.default {
    /** The [type](https://discord.com/developers/docs/resources/channel#channel-object-channel-types) of this channel. */
    type;
    constructor(data, client) {
        super(data.id, client);
        this.type = data.type;
    }
    static from(data, client) {
        switch (data.type) {
            case Constants_1.ChannelTypes.GUILD_TEXT: {
                return new TextChannel(data, client);
            }
            case Constants_1.ChannelTypes.DM: {
                return new PrivateChannel(data, client);
            }
            case Constants_1.ChannelTypes.GUILD_VOICE: {
                return new VoiceChannel(data, client);
            }
            case Constants_1.ChannelTypes.GROUP_DM: {
                return new GroupChannel(data, client);
            }
            case Constants_1.ChannelTypes.GUILD_CATEGORY: {
                return new CategoryChannel(data, client);
            }
            case Constants_1.ChannelTypes.GUILD_ANNOUNCEMENT: {
                return new AnnouncementChannel(data, client);
            }
            case Constants_1.ChannelTypes.ANNOUNCEMENT_THREAD: {
                return new AnnouncementThreadChannel(data, client);
            }
            case Constants_1.ChannelTypes.PUBLIC_THREAD: {
                return new PublicThreadChannel(data, client);
            }
            case Constants_1.ChannelTypes.PRIVATE_THREAD: {
                return new PrivateThreadChannel(data, client);
            }
            case Constants_1.ChannelTypes.GUILD_STAGE_VOICE: {
                return new StageChannel(data, client);
            }
            case Constants_1.ChannelTypes.GUILD_FORUM: {
                return new ForumChannel(data, client);
            }
            case Constants_1.ChannelTypes.GUILD_MEDIA: {
                return new MediaChannel(data, client);
            }
            default: {
                return new Channel(data, client);
            }
        }
    }
    /** A string that will mention this channel. */
    get mention() {
        return `<#${this.id}>`;
    }
    /**
     * Close a direct message, leave a group channel, or delete a guild channel.
     */
    async delete() {
        await this.client.rest.channels.delete(this.id);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            type: this.type
        };
    }
}
exports.default = Channel;
// Yes this sucks, but it works. That's the important part. Circular imports are hell.
/* eslint-disable @typescript-eslint/no-var-requires, unicorn/prefer-module */
const TextChannel = require("./TextChannel").default;
const PrivateChannel = require("./PrivateChannel").default;
const VoiceChannel = require("./VoiceChannel").default;
const CategoryChannel = require("./CategoryChannel").default;
const GroupChannel = require("./GroupChannel").default;
const AnnouncementChannel = require("./AnnouncementChannel").default;
const PublicThreadChannel = require("./PublicThreadChannel").default;
const PrivateThreadChannel = require("./PrivateThreadChannel").default;
const AnnouncementThreadChannel = require("./AnnouncementThreadChannel").default;
const StageChannel = require("./StageChannel").default;
const ForumChannel = require("./ForumChannel").default;
const MediaChannel = require("./MediaChannel").default;
/* eslint-enable @typescript-eslint/no-var-requires, unicorn/prefer-module */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbm5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zdHJ1Y3R1cmVzL0NoYW5uZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsc0JBQXNCO0FBQ3RCLDBEQUEwQjtBQUMxQiw0Q0FBNEM7QUFvQjVDLDRCQUE0QjtBQUM1QixNQUFxQixPQUFRLFNBQVEsY0FBSTtJQUNyQyxzSEFBc0g7SUFDdEgsSUFBSSxDQUFlO0lBQ25CLFlBQVksSUFBZ0IsRUFBRSxNQUFjO1FBQ3hDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztJQUMxQixDQUFDO0lBRUQsTUFBTSxDQUFDLElBQUksQ0FBb0MsSUFBZ0IsRUFBRSxNQUFjO1FBQzNFLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2hCLEtBQUssd0JBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixPQUFPLElBQUksV0FBVyxDQUFDLElBQXNCLEVBQUUsTUFBTSxDQUFNLENBQUM7WUFDaEUsQ0FBQztZQUNELEtBQUssd0JBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixPQUFPLElBQUksY0FBYyxDQUFDLElBQXlCLEVBQUUsTUFBTSxDQUFNLENBQUM7WUFDdEUsQ0FBQztZQUNELEtBQUssd0JBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixPQUFPLElBQUksWUFBWSxDQUFDLElBQXVCLEVBQUUsTUFBTSxDQUFNLENBQUM7WUFDbEUsQ0FBQztZQUNELEtBQUssd0JBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixPQUFPLElBQUksWUFBWSxDQUFDLElBQXVCLEVBQUUsTUFBTSxDQUFNLENBQUM7WUFDbEUsQ0FBQztZQUNELEtBQUssd0JBQVksQ0FBQyxjQUFjLENBQUMsQ0FB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