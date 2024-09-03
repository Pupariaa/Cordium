"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module TextableVoiceChannel */
const Member_1 = tslib_1.__importDefault(require("./Member"));
const TextableChannel_1 = tslib_1.__importDefault(require("./TextableChannel"));
const TypedCollection_1 = tslib_1.__importDefault(require("../util/TypedCollection"));
/** Represents a textable voice channel. */
class TextableVoiceChannel extends TextableChannel_1.default {
    /** The bitrate of the stage channel. */
    bitrate;
    /** The id of the voice region of the channel, `null` is automatic. */
    rtcRegion;
    /** The maximum number of members in this voice channel, `0` is unlimited. */
    userLimit;
    /** The [video quality mode](https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes) of this channel. */
    videoQualityMode;
    voiceMembers;
    constructor(data, client) {
        super(data, client);
        this.bitrate = data.bitrate;
        this.rtcRegion = data.rtc_region;
        this.userLimit = data.user_limit;
        this.videoQualityMode = data.video_quality_mode;
        this.voiceMembers = new TypedCollection_1.default(Member_1.default, client, this.client.util._getLimit("voiceMembers", this.id));
        this.update(data);
    }
    update(data) {
        super.update(data);
        if (data.bitrate !== undefined) {
            this.bitrate = data.bitrate;
        }
        if (data.rtc_region !== undefined) {
            this.rtcRegion = data.rtc_region;
        }
        if (data.user_limit !== undefined) {
            this.userLimit = data.user_limit;
        }
        if (data.video_quality_mode !== undefined) {
            this.videoQualityMode = data.video_quality_mode;
        }
    }
    get parent() {
        return super.parent;
    }
    /** The voice states related to this channel. */
    get voiceStates() {
        return this["_cachedGuild"]?.voiceStates.filter(state => state.channelID === this.id) ?? [];
    }
    /**
     * Join this stage channel.
     * @param options The options to join the channel with.
     */
    join(options) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
        return this.client.joinVoiceChannel({
            ...options,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            voiceAdapterCreator: this.guild.voiceAdapterCreator,
            guildID: this.guildID,
            channelID: this.id
        });
    }
    /** Leave this stage channel. */
    leave() {
        return this.client.leaveVoiceChannel(this.guildID);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            bitrate: this.bitrate,
            rtcRegion: this.rtcRegion,
            type: this.type,
            userLimit: this.userLimit,
            videoQualityMode: this.videoQualityMode,
            voiceMembers: this.voiceMembers.map(member => member.id)
        };
    }
}
exports.default = TextableVoiceChannel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGV4dGFibGVWb2ljZUNoYW5uZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvc3RydWN0dXJlcy9UZXh0YWJsZVZvaWNlQ2hhbm5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMsOERBQThCO0FBRTlCLGdGQUFnRDtBQUloRCxzRkFBc0Q7QUFTdEQsMkNBQTJDO0FBQzNDLE1BQXFCLG9CQUFrRSxTQUFRLHlCQUFrQjtJQUM3Ryx3Q0FBd0M7SUFDeEMsT0FBTyxDQUFTO0lBQ2hCLHNFQUFzRTtJQUN0RSxTQUFTLENBQWdCO0lBRXpCLDZFQUE2RTtJQUM3RSxTQUFTLENBQVM7SUFDbEIsMElBQTBJO0lBQzFJLGdCQUFnQixDQUFvQjtJQUNwQyxZQUFZLENBQXdEO0lBQ3BFLFlBQVksSUFBdUMsRUFBRSxNQUFjO1FBQy9ELEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzVCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUNqQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDakMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUNoRCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUkseUJBQWUsQ0FBQyxnQkFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVrQixNQUFNLENBQUMsSUFBZ0Q7UUFDdEUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQixJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ2hDLENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3JDLENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3JDLENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUN4QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1FBQ3BELENBQUM7SUFDTCxDQUFDO0lBRUQsSUFBYSxNQUFNO1FBQ2YsT0FBTyxLQUFLLENBQUMsTUFBNEMsQ0FBQztJQUM5RCxDQUFDO0lBRUQsZ0RBQWdEO0lBQ2hELElBQUksV0FBVztRQUNYLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQyxFQUFFLENBQXlCLElBQUksRUFBRSxDQUFDO0lBQ3hILENBQUM7SUFFRDs7O09BR0c7SUFDSCxJQUFJLENBQUMsT0FBdUY7UUFDeEYsc0dBQXNHO1FBQ3RHLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztZQUNoQyxHQUFHLE9BQU87WUFDVixtRUFBbUU7WUFDbkUsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUI7WUFDbkQsT0FBTyxFQUFjLElBQUksQ0FBQyxPQUFPO1lBQ2pDLFNBQVMsRUFBWSxJQUFJLENBQUMsRUFBRTtTQUMvQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsZ0NBQWdDO0lBQ2hDLEtBQUs7UUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFUSxNQUFNO1FBQ1gsT0FBTztZQUNILEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNqQixPQUFPLEVBQVcsSUFBSSxDQUFDLE9BQU87WUFDOUIsU0FBUyxFQUFTLElBQUksQ0FBQyxTQUFTO1lBQ2hDLElBQUksRUFBYyxJQUFJLENBQUMsSUFBSTtZQUMzQixTQUFTLEVBQVMsSUFBSSxDQUFDLFNBQVM7WUFDaEMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtZQUN2QyxZQUFZLEVBQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1NBQy9ELENBQUM7SUFDTixDQUFDO0NBQ0o7QUE3RUQsdUNBNkVDIn0=