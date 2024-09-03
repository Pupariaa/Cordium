/** @module Role */
import Base from "./Base";
import Permission from "./Permission";
import type Guild from "./Guild";
import type Client from "../Client";
import type { RawRole, RoleTags, EditRoleOptions } from "../types/guilds";
import type { JSONRole } from "../types/json";
/** Represents a role in a guild. */
export default class Role extends Base {
    private _cachedGuild?;
    /** The color of this role. */
    color: number;
    /** The {@link Constants~RoleFlags | flags } for this role. */
    flags: number;
    /** The id of the guild this role is in. */
    guildID: string;
    /** If this role is hoisted. */
    hoist: boolean;
    /** The icon has of this role. */
    icon: string | null;
    /** If this role is managed by an integration. */
    managed: boolean;
    /** If this role can be mentioned by anybody. */
    mentionable: boolean;
    /** The name of this role. */
    name: string;
    /** The permissions of this role. */
    permissions: Permission;
    /** The position of this role. */
    position: number;
    /** The [tags](https://discord.com/developers/docs/topics/permissions#role-object-role-tags-structure) of this role. */
    tags: RoleTags;
    /** The unicode emoji of this role. */
    unicodeEmoji: string | null;
    constructor(data: RawRole, client: Client, guildID: string);
    protected update(data: Partial<RawRole>): void;
    /** The guild this role is in. This will throw an error if the guild is not cached. */
    get guild(): Guild;
    /** A string that will mention this role. */
    get mention(): string;
    /**
     * Delete this role.
     * @param reason The reason for deleting the role.
     */
    delete(reason?: string): Promise<void>;
    /**
     * Edit this role.
     * @param options The options for editing the role.
     */
    edit(options: EditRoleOptions): Promise<Role>;
    toJSON(): JSONRole;
}
