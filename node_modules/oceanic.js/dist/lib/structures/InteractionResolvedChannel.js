"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Permission_1 = tslib_1.__importDefault(require("./Permission"));
const Channel_1 = tslib_1.__importDefault(require("./Channel"));
/** Represents a channel from an interaction option. This can be any guild channel, or a direct message. */
class InteractionResolvedChannel extends Channel_1.default {
    _cachedCompleteChannel;
    _cachedParent;
    /** The permissions the bot has in the channel. */
    appPermissions;
    /** The name of this channel. */
    name;
    /** The ID of the parent of this channel, if this represents a thread. */
    parentID;
    /** The [thread metadata](https://discord.com/developers/docs/resources/channel#thread-metadata-object-thread-metadata-structure) associated with this channel, if this represents a thread. */
    threadMetadata;
    constructor(data, client) {
        super(data, client);
        this.appPermissions = new Permission_1.default(data.permissions ?? "0");
        this.name = data.name;
        this.parentID = data.parent_id ?? null;
        this.threadMetadata = data.thread_metadata ? {
            archiveTimestamp: new Date(data.thread_metadata.archive_timestamp),
            archived: !!data.thread_metadata.archived,
            autoArchiveDuration: data.thread_metadata.auto_archive_duration,
            createTimestamp: data.thread_metadata.create_timestamp ? new Date(data.thread_metadata.create_timestamp) : null,
            locked: !!data.thread_metadata.locked,
            invitable: data.thread_metadata.invitable
        } : null;
    }
    /** The complete channel this channel option represents, if it's cached. */
    get completeChannel() {
        return this._cachedCompleteChannel ??= this.client.getChannel(this.id);
    }
    /** The parent of this channel, if this represents a thread. */
    get parent() {
        if (this.parentID !== null && this._cachedParent !== null) {
            return this._cachedParent ?? (this._cachedParent = this.client.getChannel(this.parentID));
        }
        return this._cachedParent === null ? this._cachedParent : (this._cachedParent = null);
    }
}
exports.default = InteractionResolvedChannel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3Rpb25SZXNvbHZlZENoYW5uZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvc3RydWN0dXJlcy9JbnRlcmFjdGlvblJlc29sdmVkQ2hhbm5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSxzRUFBc0M7QUFDdEMsZ0VBQWdDO0FBTWhDLDJHQUEyRztBQUMzRyxNQUFxQiwwQkFBMkIsU0FBUSxpQkFBTztJQUNuRCxzQkFBc0IsQ0FBeUI7SUFDL0MsYUFBYSxDQUEyRDtJQUNoRixrREFBa0Q7SUFDbEQsY0FBYyxDQUFhO0lBQzNCLGdDQUFnQztJQUNoQyxJQUFJLENBQWdCO0lBQ3BCLHlFQUF5RTtJQUN6RSxRQUFRLENBQWdCO0lBQ3hCLCtMQUErTDtJQUMvTCxjQUFjLENBQWdEO0lBRTlELFlBQVksSUFBbUMsRUFBRSxNQUFjO1FBQzNELEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLG9CQUFVLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUM5RCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQztRQUN2QyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLGdCQUFnQixFQUFLLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsaUJBQWlCLENBQUM7WUFDckUsUUFBUSxFQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVE7WUFDcEQsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxxQkFBcUI7WUFDL0QsZUFBZSxFQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUNuSCxNQUFNLEVBQWUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTTtZQUNsRCxTQUFTLEVBQVksSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTO1NBQ3RELENBQUMsQ0FBQyxDQUFFLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCwyRUFBMkU7SUFDM0UsSUFBSSxlQUFlO1FBQ2YsT0FBTyxJQUFJLENBQUMsc0JBQXNCLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFFRCwrREFBK0Q7SUFDL0QsSUFBSSxNQUFNO1FBQ04sSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsYUFBYSxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ3hELE9BQU8sSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQW1ELElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ2hKLENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQyxhQUFhLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDMUYsQ0FBQztDQUNKO0FBeENELDZDQXdDQyJ9