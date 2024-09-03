"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module StageInstance */
const Base_1 = tslib_1.__importDefault(require("./Base"));
const Errors_1 = require("../util/Errors");
/** Represents a stage instance. */
class StageInstance extends Base_1.default {
    _cachedChannel;
    _cachedGuild;
    _cachedScheduledEvent;
    /** The ID of the associated stage channel. */
    channelID;
    /** @deprecated If the stage channel is not discoverable. */
    discoverableDisabled;
    /** The id of the guild associated with this stage instance's stage channel. */
    guildID;
    /** The [privacy level](https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-privacy-level) of this stage instance. */
    privacyLevel;
    /** The id of the scheduled event for this stage instance, if applicable. */
    scheduledEventID;
    /** The topic of this stage instance. */
    topic;
    constructor(data, client) {
        super(data.id, client);
        this.channelID = data.channel_id;
        this.discoverableDisabled = !!data.discoverable_disabled;
        this.guildID = data.guild_id;
        this.privacyLevel = data.privacy_level;
        this.scheduledEventID = data.guild_scheduled_event_id;
        this.topic = data.topic;
        this.update(data);
    }
    update(data) {
        if (data.channel_id !== undefined) {
            this.channelID = data.channel_id;
        }
        if (data.discoverable_disabled !== undefined) {
            this.discoverableDisabled = data.discoverable_disabled;
        }
        if (data.guild_scheduled_event_id !== undefined) {
            this.scheduledEventID = data.guild_scheduled_event_id;
        }
        if (data.privacy_level !== undefined) {
            this.privacyLevel = data.privacy_level;
        }
        if (data.topic !== undefined) {
            this.topic = data.topic;
        }
    }
    /** The associated stage channel. */
    get channel() {
        return this._cachedChannel ??= this.client.getChannel(this.channelID);
    }
    /** The guild of the associated stage channel. This will throw an error if the guild is not cached. */
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
    /** The scheduled event for this stage instance, if applicable. */
    get scheduledEvent() {
        if (this.scheduledEventID !== null && this._cachedScheduledEvent !== null) {
            try {
                return this._cachedScheduledEvent ?? (this._cachedScheduledEvent = this.guild.scheduledEvents.get(this.scheduledEventID));
            }
            catch {
                return (this._cachedScheduledEvent = undefined);
            }
        }
        return this._cachedScheduledEvent === null ? this._cachedScheduledEvent : (this._cachedScheduledEvent = null);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            channelID: this.channelID,
            discoverableDisabled: this.discoverableDisabled,
            guildID: this.guildID,
            privacyLevel: this.privacyLevel,
            scheduledEventID: this.scheduledEventID,
            topic: this.topic
        };
    }
}
exports.default = StageInstance;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhZ2VJbnN0YW5jZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zdHJ1Y3R1cmVzL1N0YWdlSW5zdGFuY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNEJBQTRCO0FBQzVCLDBEQUEwQjtBQVExQiwyQ0FBK0M7QUFFL0MsbUNBQW1DO0FBQ25DLE1BQXFCLGFBQWMsU0FBUSxjQUFJO0lBQ25DLGNBQWMsQ0FBZ0I7SUFDOUIsWUFBWSxDQUFTO0lBQ3JCLHFCQUFxQixDQUE4QjtJQUMzRCw4Q0FBOEM7SUFDOUMsU0FBUyxDQUFTO0lBQ2xCLDREQUE0RDtJQUM1RCxvQkFBb0IsQ0FBVTtJQUM5QiwrRUFBK0U7SUFDL0UsT0FBTyxDQUFTO0lBQ2hCLG9KQUFvSjtJQUNwSixZQUFZLENBQTZCO0lBQ3pDLDRFQUE0RTtJQUM1RSxnQkFBZ0IsQ0FBZ0I7SUFDaEMsd0NBQXdDO0lBQ3hDLEtBQUssQ0FBUztJQUNkLFlBQVksSUFBc0IsRUFBRSxNQUFjO1FBQzlDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUNqQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztRQUN6RCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDN0IsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUM7UUFDdEQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVrQixNQUFNLENBQUMsSUFBK0I7UUFDckQsSUFB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