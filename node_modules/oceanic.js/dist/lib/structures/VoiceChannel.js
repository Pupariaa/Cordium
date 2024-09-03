"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module VoiceChannel */
const TextableVoiceChannel_1 = tslib_1.__importDefault(require("./TextableVoiceChannel"));
/** Represents a guild voice channel. */
class VoiceChannel extends TextableVoiceChannel_1.default {
    /** The status of this voice channel. */
    status;
    constructor(data, client) {
        super(data, client);
        this.status = null;
        this.update(data);
    }
    update(data) {
        this.status = data.status ?? null;
        super.update(data);
    }
    /**
     * Set a voice status in this channel.
     * @param status The voice status to set.
     */
    async setStatus(status) {
        return this.client.rest.channels.setVoiceStatus(this.id, status);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            status: this.status,
            type: this.type
        };
    }
}
exports.default = VoiceChannel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVm9pY2VDaGFubmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3N0cnVjdHVyZXMvVm9pY2VDaGFubmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJCQUEyQjtBQUMzQiwwRkFBMEQ7QUFNMUQsd0NBQXdDO0FBQ3hDLE1BQXFCLFlBQWEsU0FBUSw4QkFBa0M7SUFDeEUsd0NBQXdDO0lBQ3hDLE1BQU0sQ0FBZ0I7SUFFdEIsWUFBWSxJQUFxQixFQUFFLE1BQWM7UUFDN0MsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFFa0IsTUFBTSxDQUFDLElBQThCO1FBQ3BELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUM7UUFDbEMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFxQjtRQUNqQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRVEsTUFBTTtRQUNYLE9BQU87WUFDSCxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDakIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ25CLElBQUksRUFBSSxJQUFJLENBQUMsSUFBSTtTQUNwQixDQUFDO0lBQ04sQ0FBQztDQUNKO0FBOUJELCtCQThCQyJ9