"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const TextableVoiceChannel_1 = tslib_1.__importDefault(require("./TextableVoiceChannel"));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
/** Represents a guild stage channel. */
class StageChannel extends TextableVoiceChannel_1.default {
    constructor(data, client) {
        super(data, client);
    }
    /**
     * Create a stage instance on this channel.
     * @param options The options for creating the stage instance.
     */
    async createStageInstance(options) {
        return this.client.rest.channels.createStageInstance(this.id, options);
    }
    /**
     * Delete the stage instance on this channel.
     * @param reason The reason for deleting the stage instance.
     */
    async deleteStageInstance(reason) {
        return this.client.rest.channels.deleteStageInstance(this.id, reason);
    }
    /**
     * Edit the stage instance on this channel.
     * @param options The options for editing the stage instance.
     */
    async editStageInstance(options) {
        return this.client.rest.channels.editStageInstance(this.id, options);
    }
    /**
     * Get the stage instance associated with this channel.
     */
    async getStageInstance() {
        return this.client.rest.channels.getStageInstance(this.id);
    }
    toJSON() {
        return super.toJSON();
    }
}
exports.default = StageChannel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhZ2VDaGFubmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3N0cnVjdHVyZXMvU3RhZ2VDaGFubmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLDBGQUEwRDtBQU0xRCw2REFBNkQ7QUFDN0QsYUFBYTtBQUViLHdDQUF3QztBQUN4QyxNQUFxQixZQUFhLFNBQVEsOEJBQWtDO0lBRXhFLFlBQVksSUFBcUIsRUFBRSxNQUFjO1FBQzdDLEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFtQztRQUN6RCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsbUJBQW1CLENBQUMsTUFBZTtRQUNyQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsaUJBQWlCLENBQUMsT0FBaUM7UUFDckQsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsZ0JBQWdCO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRVEsTUFBTTtRQUNYLE9BQU8sS0FBSyxDQUFDLE1BQU0sRUFBc0IsQ0FBQztJQUM5QyxDQUFDO0NBQ0o7QUF4Q0QsK0JBd0NDIn0=