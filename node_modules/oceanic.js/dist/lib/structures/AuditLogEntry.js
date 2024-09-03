"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module AuditLogEntry */
const Base_1 = tslib_1.__importDefault(require("./Base"));
/** Represents a guild audit log entry. */
class AuditLogEntry extends Base_1.default {
    _cachedUser;
    /** The [type](https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-audit-log-events) of this action. */
    actionType;
    /** See the [audit log documentation](https://discord.com/developers/docs/resources/audit-log#audit-log-change-object) for more information. */
    changes;
    /** Additional info for specific event types */
    options;
    /** The reason for the change. */
    reason;
    /** The ID of what was targeted (webhook, user, role, etc). */
    targetID;
    /** The ID of the user or application that made the changes. */
    userID;
    constructor(data, client) {
        super(data.id, client);
        this.actionType = data.action_type;
        this.changes = data.changes;
        this.options = {
            applicationID: data.options?.application_id,
            autoModerationRuleName: data.options?.auto_moderation_rule_name,
            autoModerationRuleTriggerType: data.options?.auto_moderation_rule_trigger_type,
            channelID: data.options?.channel_id,
            count: data.options?.count,
            deleteMemberDays: data.options?.delete_member_days,
            id: data.options?.id,
            integrationType: data.options?.integration_type,
            membersRemoved: data.options?.members_removed,
            messageID: data.options?.message_id,
            roleName: data.options?.role_name,
            status: data.options?.status,
            type: data.options?.type
        };
        this.reason = data.reason;
        this.targetID = data.target_id;
        this.userID = data.user_id;
    }
    /** The user or application that made the changes. */
    get user() {
        if (this.userID !== null && this._cachedUser !== null) {
            return this._cachedUser ?? (this._cachedUser = this.client.users.get(this.userID));
        }
        return this._cachedUser === null ? this._cachedUser : (this._cachedUser = null);
    }
}
exports.default = AuditLogEntry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXVkaXRMb2dFbnRyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zdHJ1Y3R1cmVzL0F1ZGl0TG9nRW50cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNEJBQTRCO0FBQzVCLDBEQUEwQjtBQU0xQiwwQ0FBMEM7QUFDMUMsTUFBcUIsYUFBYyxTQUFRLGNBQUk7SUFDbkMsV0FBVyxDQUFlO0lBQ2xDLGtJQUFrSTtJQUNsSSxVQUFVLENBQXNCO0lBQ2hDLCtJQUErSTtJQUMvSSxPQUFPLENBQXlCO0lBQ2hDLCtDQUErQztJQUMvQyxPQUFPLENBQXdCO0lBQy9CLGlDQUFpQztJQUNqQyxNQUFNLENBQVU7SUFDaEIsOERBQThEO0lBQzlELFFBQVEsQ0FBZ0I7SUFDeEIsK0RBQStEO0lBQy9ELE1BQU0sQ0FBZ0I7SUFDdEIsWUFBWSxJQUFzQixFQUFFLE1BQWM7UUFDOUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ25DLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUM1QixJQUFJLENBQUMsT0FBTyxHQUFHO1lBQ1gsYUFBYSxFQUFrQixJQUFJLENBQUMsT0FBTyxFQUFFLGNBQWM7WUFDM0Qsc0JBQXNCLEVBQVMsSUFBSSxDQUFDLE9BQU8sRUFBRSx5QkFBeUI7WUFDdEUsNkJBQTZCLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxpQ0FBaUM7WUFDOUUsU0FBUyxFQUFzQixJQUFJLENBQUMsT0FBTyxFQUFFLFVBQVU7WUFDdkQsS0FBSyxFQUEwQixJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUs7WUFDbEQsZ0JBQWdCLEVBQWUsSUFBSSxDQUFDLE9BQU8sRUFBRSxrQkFBa0I7WUFDL0QsRUFBRSxFQUE2QixJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDL0MsZUFBZSxFQUFnQixJQUFJLENBQUMsT0FBTyxFQUFFLGdCQUFnQjtZQUM3RCxjQUFjLEVBQWlCLElBQUksQ0FBQyxPQUFPLEVBQUUsZUFBZTtZQUM1RCxTQUFTLEVBQXNCLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBVTtZQUN2RCxRQUFRLEVBQXVCLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUztZQUN0RCxNQUFNLEVBQXlCLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTTtZQUNuRCxJQUFJLEVBQTJCLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSTtTQUNwRCxDQUFDO1FBQ0YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQzFCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMvQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDL0IsQ0FBQztJQUVELHFEQUFxRDtJQUNyRCxJQUFJLElBQUk7UUFDSixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDcEQsT0FBTyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDdkYsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDLFdBQVcsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNwRixDQUFDO0NBQ0o7QUE5Q0QsZ0NBOENDIn0=