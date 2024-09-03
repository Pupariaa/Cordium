"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module VoiceState */
const Base_1 = tslib_1.__importDefault(require("./Base"));
const Errors_1 = require("../util/Errors");
/** Represents a guild member's voice state. */
class VoiceState extends Base_1.default {
    _cachedChannel;
    _cachedGuild;
    _cachedMember;
    _cachedUser;
    /** The ID of the channel the user is connected to. */
    channelID;
    /** If the associated member is deafened. */
    deaf;
    /** The ID of the guild this voice state is a part of. */
    guildID;
    /** If the associated member is muted. */
    mute;
    /** The time at which the associated member requested to speak. */
    requestToSpeakTimestamp;
    /** If the associated member is self deafened. */
    selfDeaf;
    /** If the associated member is self muted. */
    selfMute;
    /** If the associated member is streaming. */
    selfStream;
    /** If the associated member is has their camera on. */
    selfVideo;
    /** The id of the associated member's voice session. */
    sessionID;
    /** If the associated member is suppressed. */
    suppress;
    /** The ID of the user associated with this voice state. */
    userID;
    constructor(data, client) {
        super(data.user_id, client);
        this.channelID = data.channel_id;
        this.deaf = false;
        this.guildID = data.guild_id;
        this.mute = false;
        this.requestToSpeakTimestamp = null;
        this.selfDeaf = false;
        this.selfMute = false;
        this.selfStream = false;
        this.selfVideo = false;
        this.suppress = false;
        this.userID = this.id;
        this.update(data);
    }
    update(data) {
        if (data.channel_id !== undefined) {
            this.channelID = data.channel_id;
            this._cachedChannel = null;
        }
        if (data.deaf !== undefined) {
            this.deaf = data.deaf;
        }
        if (data.guild_id !== undefined) {
            this.guildID = data.guild_id;
        }
        if (data.member !== undefined) {
            this._cachedMember = this.client.util.updateMember(data.guild_id, this.id, data.member);
        }
        if (data.mute !== undefined) {
            this.mute = data.mute;
        }
        if (data.request_to_speak_timestamp !== undefined) {
            this.requestToSpeakTimestamp = data.request_to_speak_timestamp === null ? null : new Date(data.request_to_speak_timestamp);
        }
        if (data.self_deaf !== undefined) {
            this.selfDeaf = data.self_deaf;
        }
        if (data.self_mute !== undefined) {
            this.selfMute = data.self_mute;
        }
        if (data.self_stream !== undefined) {
            this.selfStream = data.self_stream;
        }
        if (data.self_video !== undefined) {
            this.selfVideo = data.self_video;
        }
        if (data.suppress !== undefined) {
            this.suppress = data.suppress;
        }
        if (data.user_id !== undefined) {
            this.userID = data.user_id;
        }
    }
    /** The channel the user is connected to. */
    get channel() {
        if (this.channelID !== null) {
            return this._cachedChannel ??= this.client.getChannel(this.channelID);
        }
        return (this._cachedChannel ??= null);
    }
    /** The guild this voice state is a part of. This will throw an error if the guild is not cached. */
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
    /** The member associated with this voice state. */
    get member() {
        return this._cachedMember ?? (this._cachedMember = this["_cachedGuild"]?.members.get(this.userID));
    }
    /** TThe user associated with this voice state. */
    get user() {
        return this._cachedUser ?? (this._cachedUser = this.client.users.get(this.userID));
    }
    toJSON() {
        return {
            ...super.toJSON(),
            channelID: this.channelID,
            deaf: this.deaf,
            guildID: this.guildID ?? undefined,
            member: this.member?.toJSON(),
            mute: this.mute,
            requestToSpeakTimestamp: this.requestToSpeakTimestamp ? this.requestToSpeakTimestamp.getTime() : null,
            selfDeaf: this.selfDeaf,
            selfMute: this.selfMute,
            selfStream: this.selfStream,
            selfVideo: this.selfVideo,
            sessionID: this.sessionID,
            suppress: this.suppress,
            user: this.user?.toJSON()
        };
    }
}
exports.default = VoiceState;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVm9pY2VTdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zdHJ1Y3R1cmVzL1ZvaWNlU3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUJBQXlCO0FBQ3pCLDBEQUEwQjtBQU8xQiwyQ0FBK0M7QUFHL0MsK0NBQStDO0FBQy9DLE1BQXFCLFVBQXdELFNBQVEsY0FBSTtJQUM3RSxjQUFjLENBQVk7SUFDMUIsWUFBWSxDQUFTO0lBQ3JCLGFBQWEsQ0FBVTtJQUN2QixXQUFXLENBQVE7SUFDM0Isc0RBQXNEO0lBQ3RELFNBQVMsQ0FBZ0I7SUFDekIsNENBQTRDO0lBQzVDLElBQUksQ0FBVTtJQUNkLHlEQUF5RDtJQUN6RCxPQUFPLENBQVM7SUFDaEIseUNBQXlDO0lBQ3pDLElBQUksQ0FBVTtJQUNkLGtFQUFrRTtJQUNsRSx1QkFBdUIsQ0FBYztJQUNyQyxpREFBaUQ7SUFDakQsUUFBUSxDQUFVO0lBQ2xCLDhDQUE4QztJQUM5QyxRQUFRLENBQVU7SUFDbEIsNkNBQTZDO0lBQzdDLFVBQVUsQ0FBVTtJQUNwQix1REFBdUQ7SUFDdkQsU0FBUyxDQUFVO0lBQ25CLHVEQUF1RDtJQUN2RCxTQUFTLENBQVU7SUFDbkIsOENBQThDO0lBQzlDLFFBQVEsQ0FBVTtJQUNsQiwyREFBMkQ7SUFDM0QsTUFBTSxDQUFTO0lBQ2YsWUFBWSxJQUFtQixFQUFFLE1BQWM7UUFDM0MsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVMsQ0FBQztRQUM5QixJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztRQUNsQixJQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFD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