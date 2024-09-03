"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module Member */
const Base_1 = tslib_1.__importDefault(require("./Base"));
const Constants_1 = require("../Constants");
const Routes = tslib_1.__importStar(require("../util/Routes"));
const Errors_1 = require("../util/Errors");
/** Represents a member of a guild. */
class Member extends Base_1.default {
    _cachedGuild;
    /** The member's avatar hash, if they have set a guild avatar. */
    avatar;
    /** The data for this user's avatar decoration. */
    avatarDecorationData;
    /** The member's banner hash, if they have set a guild banner. */
    banner;
    /** When the member's [timeout](https://support.discord.com/hc/en-us/articles/4413305239191-Time-Out-FAQ) will expire, if active. */
    communicationDisabledUntil;
    /** If this member is server deafened. */
    deaf;
    /** The member's [flags](https://discord.com/developers/docs/resources/guild#guild-member-object-flags). */
    flags;
    /** The id of the guild this member is for. */
    guildID;
    /** Undocumented. */
    isPending;
    /** The date at which this member joined the guild. */
    joinedAt;
    /** If this member is server muted. */
    mute;
    /** This member's nickname, if any. */
    nick;
    /** If this member has not passed the guild's [membership screening](https://discord.com/developers/docs/resources/guild#membership-screening-object) requirements. */
    pending;
    /** The date at which this member started boosting the guild, if applicable. */
    premiumSince;
    /** The presence of this member. */
    presence;
    /** The roles this member has. */
    roles;
    /** The user associated with this member. */
    user;
    constructor(data, client, guildID) {
        let user;
        let id;
        if (!data.user && data.id) {
            user = client.users.get(id = data.id);
        }
        else if (data.user) {
            id = (user = client.users.update(data.user)).id;
        }
        if (!user) {
            throw new TypeError(`Member received without a user${id === undefined ? " or id." : `: ${id}`}`);
        }
        super(user.id, client);
        this.avatar = null;
        this.avatarDecorationData = null;
        this.banner = null;
        this.communicationDisabledUntil = null;
        this.deaf = !!data.deaf;
        this.flags = 0;
        this.guildID = guildID;
        this.joinedAt = null;
        this.mute = !!data.mute;
        this.nick = null;
        this.pending = false;
        this.premiumSince = null;
        this.roles = [];
        this.user = user;
        this.update(data);
    }
    toggleFlag(flag, enable, reason) {
        return this.edit({ flags: enable ? this.flags | flag : this.flags & ~flag, reason });
    }
    update(data) {
        if (data.avatar !== undefined) {
            this.avatar = data.avatar;
        }
        if (data.avatar_decoration_data !== undefined) {
            this.avatarDecorationData = data.avatar_decoration_data ? {
                asset: data.avatar_decoration_data.asset,
                skuID: data.avatar_decoration_data.sku_id
            } : null;
        }
        if (data.banner !== undefined) {
            this.banner = data.banner;
        }
        if (data.communication_disabled_until !== undefined) {
            this.communicationDisabledUntil = data.communication_disabled_until === null ? null : new Date(data.communication_disabled_until);
        }
        if (data.deaf !== undefined) {
            this.deaf = data.deaf;
        }
        if (data.flags !== undefined) {
            this.flags = data.flags;
        }
        if (data.is_pending !== undefined) {
            this.isPending = data.is_pending;
        }
        if (data.joined_at !== undefined) {
            this.joinedAt = data.joined_at === null ? null : new Date(data.joined_at);
        }
        if (data.mute !== undefined) {
            this.mute = data.mute;
        }
        if (data.nick !== undefined) {
            this.nick = data.nick;
        }
        if (data.pending !== undefined) {
            this.pending = data.pending;
        }
        if (data.premium_since !== undefined) {
            this.premiumSince = data.premium_since === null ? null : new Date(data.premium_since);
        }
        if (data.roles !== undefined) {
            this.roles = data.roles;
        }
        if (data.user !== undefined) {
            this.user = this.client.users.update(data.user);
        }
    }
    /** If the user associated with this member is a bot. */
    get bot() {
        return this.user.bot;
    }
    /** The Discord-tag of the user associated with this member. */
    get discriminator() {
        return this.user.discriminator;
    }
    /** The nick of this member if set, the display name of this member's user if set, or their username. */
    get displayName() {
        return this.nick ?? this.user.globalName ?? this.username;
    }
    /** The guild this member is for. This will throw an error if the guild is not cached. */
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
    /** A string that will mention this member. */
    get mention() {
        return this.user.mention;
    }
    /** The permissions of this member. */
    get permissions() {
        return this.guild.permissionsOf(this);
    }
    /** The user associated with this member's public [flags](https://discord.com/developers/docs/resources/user#user-object-user-flags). */
    get publicFlags() {
        return this.user.publicFlags;
    }
    /** If this user associated with this member is an official discord system user. */
    get system() {
        return this.user.system;
    }
    /** The 4 digits after this user's username, if they have not been migrated. If migrated, this will be a single "0". */
    get tag() {
        return this.user.tag;
    }
    /** The username associated with this member's user. */
    get username() {
        return this.user.username;
    }
    /** The voice state of this member. */
    get voiceState() {
        return this.guild.voiceStates.get(this.id) ?? null;
    }
    /**
     * Add a role to this member.
     * @param roleID The ID of the role to add.
     */
    async addRole(roleID, reason) {
        await this.client.rest.guilds.addMemberRole(this.guildID, this.id, roleID, reason);
    }
    /**
     * The url of this member's avatar decoration (or their user avatar decoration). This will always be a png.
     * Discord does not combine the decoration and their current avatar for you. This is ONLY the decoration.
     * @param size The dimensions of the image.
     */
    avatarDecorationURL(size) {
        return this.avatarDecorationData ? this.client.util.formatImage(Routes.AVATAR_DECORATION(this.avatarDecorationData.asset), "png", size) : this.user.avatarDecorationURL(size);
    }
    /**
     * The url of this user's guild avatar (or their user avatar if no guild avatar is set, or their default avatar if none apply).
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    avatarURL(format, size) {
        return this.avatar === null ? this.user.avatarURL(format, size) : this.client.util.formatImage(Routes.GUILD_AVATAR(this.guildID, this.id, this.avatar), format, size);
    }
    /**
     * Create a ban for this member.
     * @param options The options for the ban.
     */
    async ban(options) {
        await this.client.rest.guilds.createBan(this.guildID, this.id, options);
    }
    /**
     * The url of this user's guild banner (or their user banner if no guild banner is set).
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    bannerURL(format, size) {
        return this.banner === null ? this.user.bannerURL(format, size) : this.client.util.formatImage(Routes.MEMBER_BANNER(this.guildID, this.id, this.banner), format, size);
    }
    /**
     * Disable the `BYPASSES_VERIFICATION` flag for this member. Requires any of the following permission sets:
     * * MANAGE_GUILD
     * * MANAGE_ROLES
     * * MODERATE_MEMBERS and KICK_MEMBERS and BAN_MEMBERS
     * @param reason The reason for disabling the flag.
     */
    async disableVerificationBypass(reason) {
        await this.toggleFlag(Constants_1.GuildMemberFlags.BYPASSES_VERIFICATION, false, reason);
    }
    /**
     * Edit this member. Use {@link Guild#editCurrentMember | Guild#editCurrentMember} if you wish to update the nick of this client using the `CHANGE_NICKNAME` permission.
     * @param options The options for editing the member.
     */
    async edit(options) {
        return this.client.rest.guilds.editMember(this.guildID, this.id, options);
    }
    /**
     * Edit this guild member's voice state. `channelID` is required, and the user must already be in that channel. See [Discord's docs](https://discord.com/developers/docs/resources/guild#modify-user-voice-state) for more information.
     * @param options The options for editing the voice state.
     */
    async editVoiceState(options) {
        return this.client.rest.guilds.editUserVoiceState(this.guildID, this.id, options);
    }
    /**
     * Enable the `BYPASSES_VERIFICATION` flag for this member. Requires the **Manage Guild** permission.
     * @param reason The reason for enabling the flag.
     */
    async enableVerificationBypass(reason) {
        await this.toggleFlag(Constants_1.GuildMemberFlags.BYPASSES_VERIFICATION, true, reason);
    }
    /**
     * Remove a member from the guild.
     * @param reason The reason for the kick.
     */
    async kick(reason) {
        await this.client.rest.guilds.removeMember(this.guildID, this.id, reason);
    }
    /**
     * Remove a role from this member.
     * @param roleID The ID of the role to remove.
     * @param reason The reason for removing the role.
     */
    async removeRole(roleID, reason) {
        await this.client.rest.guilds.removeMemberRole(this.guildID, this.id, roleID, reason);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            avatar: this.avatar,
            avatarDecorationData: this.avatarDecorationData,
            banner: this.banner,
            communicationDisabledUntil: this.communicationDisabledUntil?.getTime() ?? null,
            deaf: this.deaf,
            flags: this.flags,
            guildID: this.guildID,
            isPending: this.isPending,
            joinedAt: this.joinedAt?.getTime() ?? null,
            mute: this.mute,
            nick: this.nick,
            pending: this.pending,
            premiumSince: this.premiumSince?.getTime() ?? null,
            presence: this.presence,
            roles: this.roles,
            user: this.user.toJSON()
        };
    }
    /**
     * Remove a ban for this member.
     * @param reason The reason for removing the ban.
     */
    async unban(reason) {
        await this.client.rest.guilds.removeBan(this.guildID, this.id, reason);
    }
}
exports.default = Member;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWVtYmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3N0cnVjdHVyZXMvTWVtYmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFCQUFxQjtBQUNyQiwwREFBMEI7QUFLMUIsNENBQWtFO0FBQ2xFLCtEQUF5QztBQVd6QywyQ0FBK0M7QUFHL0Msc0NBQXNDO0FBQ3RDLE1BQXFCLE1BQU8sU0FBUSxjQUFJO0lBQzVCLFlBQVksQ0FBUztJQUM3QixpRUFBaUU7SUFDakUsTUFBTSxDQUFnQjtJQUN0QixrREFBa0Q7SUFDbEQsb0JBQW9CLENBQThCO0lBQ2xELGlFQUFpRTtJQUNqRSxNQUFNLENBQWdCO0lBQ3RCLG9JQUFvSTtJQUNwSSwwQkFBMEIsQ0FBYztJQUN4Qyx5Q0FBeUM7SUFDekMsSUFBSSxDQUFVO0lBQ2QsMkdBQTJHO0lBQzNHLEtBQUssQ0FBUztJQUNkLDhDQUE4QztJQUM5QyxPQUFPLENBQVM7SUFDaEIsb0JBQW9CO0lBQ3BCLFNBQVMsQ0FBVztJQUNwQixzREFBc0Q7SUFDdEQsUUFBUSxDQUFjO0lBQ3RCLHNDQUFzQztJQUN0QyxJQUFJLENBQVU7SUFDZCxzQ0FBc0M7SUFDdEMsSUFBSSxDQUFnQjtJQUNwQixzS0FBc0s7SUFDdEssT0FBTyxDQUFVO0lBQ2pCLCtFQUErRTtJQUMvRSxZQUFZLENBQWM7SUFDMUIsbUNBQW1DO0lBQ25DLFFBQVEsQ0FBWTtJQUNwQixpQ0FBaUM7SUFDakMsS0FBSyxDQUFnQjtJQUNyQiw0Q0FBNEM7SUFDNUMsSUFBSSxDQUFPO0lBQ1gsWUFBWSxJQUFpRCxFQUFFLE1BQWMsRUFBRSxPQUFlO1FBQzFGLElBQUksSUFBc0IsQ0FBQztRQUMzQixJQUFJLEVBQXNCLENBQUM7UUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3hCLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxF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QyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQ3RJLENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQzFCLENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQzVCLENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3JDLENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDL0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUNELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDMUIsQ0FBQztRQUNELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDMUIsQ0FBQztRQUNELElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUM3QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDaEMsQ0FBQztRQUNELElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxTQUFTLEVBQUUsQ0FBQztZ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