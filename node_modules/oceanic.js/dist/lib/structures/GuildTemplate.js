"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Errors_1 = require("../util/Errors");
/** Represents a guild template. */
class GuildTemplate {
    _cachedSourceGuild;
    client;
    /** The code of the template. */
    code;
    /** When this template was created. */
    createdAt;
    /** The creator of this template. */
    creator;
    /** The description of this template. */
    description;
    /** If this template has unsynced changes. */
    isDirty;
    /** The name of this template. */
    name;
    /** A snapshot of the guild. */
    serializedSourceGuild;
    /** The ID of the source guild of this template. */
    sourceGuildID;
    /** When this template was last updated. */
    updatedAt;
    /** The amount of times this template has been used. */
    usageCount;
    constructor(data, client) {
        Object.defineProperty(this, "client", {
            value: client,
            enumerable: false,
            writable: false,
            configurable: false
        });
        this.code = data.code;
        this.createdAt = new Date(data.created_at);
        this.creator = this.client.users.update(data.creator);
        this.description = null;
        this.isDirty = null;
        this.name = data.name;
        this.serializedSourceGuild = data.serialized_source_guild;
        this.sourceGuildID = data.source_guild_id;
        this.updatedAt = new Date(data.updated_at);
        this.usageCount = data.usage_count;
        this.update(data);
    }
    update(data) {
        if (data.description !== undefined) {
            this.description = data.description;
        }
        if (data.is_dirty !== undefined) {
            this.isDirty = data.is_dirty;
        }
        if (data.name !== undefined) {
            this.name = data.name;
        }
        if (data.serialized_source_guild !== undefined) {
            this.serializedSourceGuild = data.serialized_source_guild;
        }
        if (data.source_guild_id !== undefined) {
            this.sourceGuildID = data.source_guild_id;
        }
        if (data.updated_at !== undefined) {
            this.updatedAt = new Date(data.updated_at);
        }
        if (data.usage_count !== undefined) {
            this.usageCount = data.usage_count;
        }
    }
    /** The source guild of this template. This will throw an error if the guild is not cached. */
    get sourceGuild() {
        this._cachedSourceGuild ??= this.client.guilds.get(this.sourceGuildID);
        if (!this._cachedSourceGuild) {
            if (this.client.options.restMode) {
                throw new Errors_1.UncachedError(`${this.constructor.name}#sourceGuild is not present when rest mode is enabled.`);
            }
            if (!this.client.shards.connected) {
                throw new Errors_1.UncachedError(`${this.constructor.name}#sourceGuild is not present without a gateway connection.`);
            }
            throw new Errors_1.UncachedError(`${this.constructor.name}#sourceGuild is not present.`);
        }
        return this._cachedSourceGuild;
    }
    /**
     * Create a guild from this template. This can only be used by bots in less than 10 guilds.
     * @param options The options for creating the guild.
     */
    async createGuild(options) {
        return this.client.rest.guilds.createFromTemplate(this.code, options);
    }
    /**
     * Delete this template.
     */
    async delete() {
        return this.client.rest.guilds.deleteTemplate(this.sourceGuild.id, this.code);
    }
    /**
     * Edit this template.
     * @param options The options for editing the template.
     */
    async editTemplate(options) {
        return this.client.rest.guilds.editTemplate(this.sourceGuild.id, this.code, options);
    }
    /**
     * Sync this template.
     */
    async syncTemplate() {
        return this.client.rest.guilds.syncTemplate(this.sourceGuild.id, this.code);
    }
    toJSON() {
        return {
            code: this.code,
            createdAt: this.createdAt.getTime(),
            creator: this.creator.toJSON(),
            description: this.description,
            isDirty: this.isDirty,
            name: this.name,
            serializedSourceGuild: this.serializedSourceGuild,
            sourceGuildID: this.sourceGuildID,
            updatedAt: this.updatedAt.getTime(),
            usageCount: this.usageCount
        };
    }
}
exports.default = GuildTemplate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3VpbGRUZW1wbGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zdHJ1Y3R1cmVzL0d1aWxkVGVtcGxhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFPQSwyQ0FBK0M7QUFFL0MsbUNBQW1DO0FBQ25DLE1BQXFCLGFBQWE7SUFDdEIsa0JBQWtCLENBQVM7SUFDbkMsTUFBTSxDQUFVO0lBQ2hCLGdDQUFnQztJQUNoQyxJQUFJLENBQVM7SUFDYixzQ0FBc0M7SUFDdEMsU0FBUyxDQUFPO0lBQ2hCLG9DQUFvQztJQUNwQyxPQUFPLENBQU87SUFDZCx3Q0FBd0M7SUFDeEMsV0FBVyxDQUFnQjtJQUMzQiw2Q0FBNkM7SUFDN0MsT0FBTyxDQUFpQjtJQUN4QixpQ0FBaUM7SUFDakMsSUFBSSxDQUFTO0lBQ2IsK0JBQStCO0lBQy9CLHFCQUFxQixDQUFvQjtJQUN6QyxtREFBbUQ7SUFDbkQsYUFBYSxDQUFTO0lBQ3RCLDJDQUEyQztJQUMzQyxTQUFTLENBQU87SUFDaEIsdURBQXVEO0lBQ3ZELFVBQVUsQ0FBUztJQUNuQixZQUFZLElBQXNCLEVBQUUsTUFBYztRQUM5QyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDbEMsS0FBSyxFQUFTLE1BQU07WUFDcEIsVUFBVSxFQUFJLEtBQUs7WUFDbkIsUUFBUSxFQUFNLEtBQUs7WUFDbkIsWUFBWSxFQUFFLEtBQUs7U0FDdEIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsV0FBVyxH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