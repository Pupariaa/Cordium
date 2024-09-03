"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module AutoModerationRule */
const Base_1 = tslib_1.__importDefault(require("./Base"));
const Errors_1 = require("../util/Errors");
/** Represents an auto moderation rule. */
class AutoModerationRule extends Base_1.default {
    _cachedGuild;
    /** The actions that will execute when this rule is triggered. */
    actions;
    /** The creator of this rule. */
    creator;
    /** The ID of the creator of this rule. */
    creatorID;
    /** If this rule is enabled. */
    enabled;
    /** The [event type](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-event-types) of this rule. */
    eventType;
    /** The channels that are exempt from this rule. */
    exemptChannels;
    /** The roles that are exempt from this rule. */
    exemptRoles;
    /** The id of the guild this rule is in. */
    guildID;
    /** The name of this rule */
    name;
    /** The metadata of this rule's trigger.  */
    triggerMetadata;
    /** This rule's [trigger type](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-types). */
    triggerType;
    constructor(data, client) {
        super(data.id, client);
        this.actions = data.actions.map(a => ({
            metadata: {
                channelID: a.metadata.channel_id,
                customMessage: a.metadata.custom_message,
                durationSeconds: a.metadata.duration_seconds
            },
            type: a.type
        }));
        this.creator = client.users.get(data.creator_id);
        this.creatorID = data.creator_id;
        this.enabled = data.enabled;
        this.eventType = data.event_type;
        this.exemptChannels = data.exempt_channels;
        this.exemptRoles = data.exempt_roles;
        this.guildID = data.guild_id;
        this.name = data.name;
        this.triggerMetadata = {
            allowList: data.trigger_metadata.allow_list,
            keywordFilter: data.trigger_metadata.keyword_filter,
            mentionRaidProtectionEnabled: data.trigger_metadata.mention_raid_protection_enabled,
            mentionTotalLimit: data.trigger_metadata.mention_total_limit,
            presets: data.trigger_metadata.presets,
            regexPatterns: data.trigger_metadata.regex_patterns
        };
        this.triggerType = data.trigger_type;
        this.update(data);
    }
    update(data) {
        if (data.actions !== undefined) {
            this.actions = data.actions.map(a => ({
                metadata: {
                    channelID: a.metadata.channel_id,
                    customMessage: a.metadata.custom_message,
                    durationSeconds: a.metadata.duration_seconds
                },
                type: a.type
            }));
        }
        if (data.enabled !== undefined) {
            this.enabled = data.enabled;
        }
        if (data.event_type !== undefined) {
            this.eventType = data.event_type;
        }
        if (data.exempt_channels !== undefined) {
            this.exemptChannels = data.exempt_channels;
        }
        if (data.exempt_roles !== undefined) {
            this.exemptRoles = data.exempt_roles;
        }
        if (data.name !== undefined) {
            this.name = data.name;
        }
        if (data.trigger_metadata !== undefined) {
            this.triggerMetadata = {
                allowList: data.trigger_metadata.allow_list,
                keywordFilter: data.trigger_metadata.keyword_filter,
                mentionTotalLimit: data.trigger_metadata.mention_total_limit,
                presets: data.trigger_metadata.presets,
                regexPatterns: data.trigger_metadata.regex_patterns
            };
        }
        if (data.trigger_type !== undefined) {
            this.triggerType = data.trigger_type;
        }
    }
    /** The guild this rule is in. This will throw an error if the guild is not cached. */
    get guild() {
        this._cachedGuild ??= this.client.guilds.get(this.guildID);
        if (!this._cachedGuild) {
            throw new Errors_1.UncachedError(this, "guild", "GUILDS", this.client);
        }
        return this._cachedGuild;
    }
    /**
     * Delete this auto moderation rule.
     * @param reason The reason for deleting this rule.
     */
    async deleteAutoModerationRule(reason) {
        return this.client.rest.guilds.deleteAutoModerationRule(this.guildID, this.id, reason);
    }
    /**
     * Edit this auto moderation rule.
     * @param options The options for editing the rule.
     */
    async edit(options) {
        return this.client.rest.guilds.editAutoModerationRule(this.guildID, this.id, options);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            actions: this.actions,
            creatorID: this.creatorID,
            enabled: this.enabled,
            eventType: this.eventType,
            exemptChannels: this.exemptChannels,
            exemptRoles: this.exemptRoles,
            guildID: this.guildID,
            name: this.name,
            triggerMetadata: this.triggerMetadata,
            triggerType: this.triggerType
        };
    }
}
exports.default = AutoModerationRule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXV0b01vZGVyYXRpb25SdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3N0cnVjdHVyZXMvQXV0b01vZGVyYXRpb25SdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUFpQztBQUNqQywwREFBMEI7QUFPMUIsMkNBQStDO0FBRS9DLDBDQUEwQztBQUMxQyxNQUFxQixrQkFBbUIsU0FBUSxjQUFJO0lBQ3hDLFlBQVksQ0FBUztJQUM3QixpRUFBaUU7SUFDakUsT0FBTyxDQUE4QjtJQUNyQyxnQ0FBZ0M7SUFDaEMsT0FBTyxDQUFRO0lBQ2YsMENBQTBDO0lBQzFDLFNBQVMsQ0FBUztJQUNsQiwrQkFBK0I7SUFDL0IsT0FBTyxDQUFVO0lBQ2pCLDRJQUE0STtJQUM1SSxTQUFTLENBQTJCO0lBQ3BDLG1EQUFtRDtJQUNuRCxjQUFjLENBQWdCO0lBQzlCLGdEQUFnRDtJQUNoRCxXQUFXLENBQWdCO0lBQzNCLDJDQUEyQztJQUMzQyxPQUFPLENBQVM7SUFDaEIsNEJBQTRCO0lBQzVCLElBQUksQ0FBUztJQUNiLDRDQUE0QztJQUM1QyxlQUFlLENBQWtCO0lBQ2pDLDJJQUEySTtJQUMzSSxXQUFXLENBQTZCO0lBQ3hDLFlBQVksSUFBMkIsRUFBRSxNQUFjO1FBQ25ELEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2xDLFFBQVEsRUFBRTtnQkFDTixTQUFTLEVBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVO2dCQUN0QyxhQUFhLEVBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxjQUFjO2dCQUMxQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0I7YUFDL0M7WUFDRCxJQUFJLEVBQUUsQ0FBQyxDQUFDLElB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