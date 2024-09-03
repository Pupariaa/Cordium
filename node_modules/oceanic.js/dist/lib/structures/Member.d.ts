/** @module Member */
import Base from "./Base";
import type User from "./User";
import type Guild from "./Guild";
import type Permission from "./Permission";
import type VoiceState from "./VoiceState";
import { type ImageFormat } from "../Constants";
import type Client from "../Client";
import type { CreateBanOptions, EditMemberOptions, EditUserVoiceStateOptions, RawMember, RESTMember, Presence } from "../types/guilds";
import type { JSONMember } from "../types/json";
import type { AvatarDecorationData } from "../types";
/** Represents a member of a guild. */
export default class Member extends Base {
    private _cachedGuild?;
    /** The member's avatar hash, if they have set a guild avatar. */
    avatar: string | null;
    /** The data for this user's avatar decoration. */
    avatarDecorationData: AvatarDecorationData | null;
    /** The member's banner hash, if they have set a guild banner. */
    banner: string | null;
    /** When the member's [timeout](https://support.discord.com/hc/en-us/articles/4413305239191-Time-Out-FAQ) will expire, if active. */
    communicationDisabledUntil: Date | null;
    /** If this member is server deafened. */
    deaf: boolean;
    /** The member's [flags](https://discord.com/developers/docs/resources/guild#guild-member-object-flags). */
    flags: number;
    /** The id of the guild this member is for. */
    guildID: string;
    /** Undocumented. */
    isPending?: boolean;
    /** The date at which this member joined the guild. */
    joinedAt: Date | null;
    /** If this member is server muted. */
    mute: boolean;
    /** This member's nickname, if any. */
    nick: string | null;
    /** If this member has not passed the guild's [membership screening](https://discord.com/developers/docs/resources/guild#membership-screening-object) requirements. */
    pending: boolean;
    /** The date at which this member started boosting the guild, if applicable. */
    premiumSince: Date | null;
    /** The presence of this member. */
    presence?: Presence;
    /** The roles this member has. */
    roles: Array<string>;
    /** The user associated with this member. */
    user: User;
    constructor(data: (RawMember | RESTMember) & {
        id?: string;
    }, client: Client, guildID: string);
    private toggleFlag;
    protected update(data: Partial<RawMember | RESTMember>): void;
    /** If the user associated with this member is a bot. */
    get bot(): boolean;
    /** The Discord-tag of the user associated with this member. */
    get discriminator(): string;
    /** The nick of this member if set, the display name of this member's user if set, or their username. */
    get displayName(): string;
    /** The guild this member is for. This will throw an error if the guild is not cached. */
    get guild(): Guild;
    /** A string that will mention this member. */
    get mention(): string;
    /** The permissions of this member. */
    get permissions(): Permission;
    /** The user associated with this member's public [flags](https://discord.com/developers/docs/resources/user#user-object-user-flags). */
    get publicFlags(): number;
    /** If this user associated with this member is an official discord system user. */
    get system(): boolean;
    /** The 4 digits after this user's username, if they have not been migrated. If migrated, this will be a single "0". */
    get tag(): string;
    /** The username associated with this member's user. */
    get username(): string;
    /** The voice state of this member. */
    get voiceState(): VoiceState | null;
    /**
     * Add a role to this member.
     * @param roleID The ID of the role to add.
     */
    addRole(roleID: string, reason?: string): Promise<void>;
    /**
     * The url of this member's avatar decoration (or their user avatar decoration). This will always be a png.
     * Discord does not combine the decoration and their current avatar for you. This is ONLY the decoration.
     * @param size The dimensions of the image.
     */
    avatarDecorationURL(size?: number): string | null;
    /**
     * The url of this user's guild avatar (or their user avatar if no guild avatar is set, or their default avatar if none apply).
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    avatarURL(format?: ImageFormat, size?: number): string;
    /**
     * Create a ban for this member.
     * @param options The options for the ban.
     */
    ban(options?: CreateBanOptions): Promise<void>;
    /**
     * The url of this user's guild banner (or their user banner if no guild banner is set).
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    bannerURL(format?: ImageFormat, size?: number): string | null;
    /**
     * Disable the `BYPASSES_VERIFICATION` flag for this member. Requires any of the following permission sets:
     * * MANAGE_GUILD
     * * MANAGE_ROLES
     * * MODERATE_MEMBERS and KICK_MEMBERS and BAN_MEMBERS
     * @param reason The reason for disabling the flag.
     */
    disableVerificationBypass(reason?: string): Promise<void>;
    /**
     * Edit this member. Use {@link Guild#editCurrentMember | Guild#editCurrentMember} if you wish to update the nick of this client using the `CHANGE_NICKNAME` permission.
     * @param options The options for editing the member.
     */
    edit(options: EditMemberOptions): Promise<Member>;
    /**
     * Edit this guild member's voice state. `channelID` is required, and the user must already be in that channel. See [Discord's docs](https://discord.com/developers/docs/resources/guild#modify-user-voice-state) for more information.
     * @param options The options for editing the voice state.
     */
    editVoiceState(options: EditUserVoiceStateOptions): Promise<void>;
    /**
     * Enable the `BYPASSES_VERIFICATION` flag for this member. Requires the **Manage Guild** permission.
     * @param reason The reason for enabling the flag.
     */
    enableVerificationBypass(reason?: string): Promise<void>;
    /**
     * Remove a member from the guild.
     * @param reason The reason for the kick.
     */
    kick(reason?: string): Promise<void>;
    /**
     * Remove a role from this member.
     * @param roleID The ID of the role to remove.
     * @param reason The reason for removing the role.
     */
    removeRole(roleID: string, reason?: string): Promise<void>;
    toJSON(): JSONMember;
    /**
     * Remove a ban for this member.
     * @param reason The reason for removing the ban.
     */
    unban(reason?: string): Promise<void>;
}
