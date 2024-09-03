"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** @module SelectMenuValuesWrapper */
const Errors_1 = require("../Errors");
const Constants_1 = require("../../Constants");
/** A wrapper for select menu data. */
class SelectMenuValuesWrapper {
    /** The raw received values. */
    raw;
    /** The resolved data for this instance. */
    resolved;
    constructor(resolved, values) {
        this.resolved = resolved;
        this.raw = values;
    }
    /**
     * Get the selected channels.
     *
     * If `ensurePresent` is false, channels that aren't in resolved will be ignored.
     * @param ensurePresent If true, an error will be thrown if any value cannot be mapped to a channel.
     */
    getChannels(ensurePresent) {
        return this.raw.map(id => {
            const ch = this.resolved.channels.get(id);
            if (!ch && ensurePresent) {
                throw new Errors_1.WrapperError(`Failed to find channel in resolved data: ${id}`);
            }
            return ch;
        }).filter(Boolean);
    }
    /**
     * Get the complete version of the selected channels. This will only succeed if the channel is cached. If the channel is private and isn't cached, an `InteractionResolvedChannel` instance will still be returned.
     *
     * If `ensurePresent` is false, channels that aren't in resolved will be ignored.
     * @param ensurePresent If true, an error will be thrown if any value cannot be mapped to a channel.
     */
    getCompleteChannels(ensurePresent) {
        return this.raw.map(id => {
            const ch = this.resolved.channels.get(id);
            if (ch && ch.type === Constants_1.ChannelTypes.DM) {
                return ch?.completeChannel ?? ch;
            }
            if (!ch && ensurePresent) {
                throw new Errors_1.WrapperError(`Failed to find channel in resolved data: ${id}`);
            }
            return ch;
        }).filter(Boolean);
    }
    /**
     * Get the selected members.
     *
     * If `ensurePresent` is false, members that aren't in resolved will be ignored.
     * @param ensurePresent If true, an error will be thrown if any value cannot be mapped to a member.
     */
    getMembers(ensurePresent) {
        return this.raw.map(id => {
            const member = this.resolved.members.get(id);
            if (!member && ensurePresent) {
                throw new Errors_1.WrapperError(`Failed to find member in resolved data: ${id}`);
            }
            return member;
        }).filter(Boolean);
    }
    /**
     * Get the selected mentionables. (users, roles)
     *
     * If `ensurePresent` is false, mentionables that aren't in resolved will be ignored.
     * @param ensurePresent If true, an error will be thrown if any value cannot be mapped to a user, or role.
     */
    getMentionables(ensurePresent) {
        const res = [];
        for (const id of this.raw) {
            const role = this.resolved.roles.get(id);
            const user = this.resolved.users.get(id);
            if ((!role && !user)) {
                if (ensurePresent) {
                    throw new Errors_1.WrapperError(`Failed to find mentionable in resolved data: ${id}`);
                }
            }
            else {
                res.push((role ?? user));
            }
        }
        return res;
    }
    /**
     * Get the selected roles.
     *
     * If `ensurePresent` is false, roles that aren't in resolved will be ignored.
     * @param ensurePresent If true, an error will be thrown if any value cannot be mapped to a role.
     */
    getRoles(ensurePresent) {
        return this.raw.map(id => {
            const role = this.resolved.roles.get(id);
            if (!role && ensurePresent) {
                throw new Errors_1.WrapperError(`Failed to find role in resolved data: ${id}`);
            }
            return role;
        }).filter(Boolean);
    }
    /**
     * Get the selected string values. This cannot fail.
     */
    getStrings() {
        return this.raw;
    }
    /**
     * Get the selected users.
     *
     * If `ensurePresent` is false, users that aren't in resolved will be ignored.
     * @param ensurePresent If true, an error will be thrown if any value cannot be mapped to a user.
     */
    getUsers(ensurePresent) {
        return this.raw.map(id => {
            const user = this.resolved.users.get(id);
            if (!user && ensurePresent) {
                throw new Errors_1.WrapperError(`Failed to find user in resolved data: ${id}`);
            }
            return user;
        }).filter(Boolean);
    }
}
exports.default = SelectMenuValuesWrapper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VsZWN0TWVudVZhbHVlc1dyYXBwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9saWIvdXRpbC9pbnRlcmFjdGlvbnMvU2VsZWN0TWVudVZhbHVlc1dyYXBwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQ0FBc0M7QUFDdEMsc0NBQXlDO0FBQ3pDLCtDQUErQztBQVEvQyxzQ0FBc0M7QUFDdEMsTUFBcUIsdUJBQXVCO0lBQ3hDLCtCQUErQjtJQUMvQixHQUFHLENBQWdCO0lBQ25CLDJDQUEyQztJQUMzQyxRQUFRLENBQTBDO0lBQ2xELFlBQVksUUFBaUQsRUFBRSxNQUFxQjtRQUNoRixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsR0FBRyxHQUFLLE1BQU0sQ0FBQztJQUN4QixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxXQUFXLENBQUMsYUFBdUI7UUFDL0IsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNyQixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxhQUFhLEVBQUUsQ0FBQztnQkFDdkIsTUFBTSxJQUFJLHFCQUFZLENBQUMsNENBQTRDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDN0UsQ0FBQztZQUNELE9BQU8sRUFBRyxDQUFDO1FBQ2YsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILG1CQUFtQixDQUFDLGFBQXVCO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDckIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMs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