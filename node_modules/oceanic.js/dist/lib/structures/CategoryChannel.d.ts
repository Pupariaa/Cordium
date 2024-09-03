/** @module CategoryChannel */
import PermissionOverwrite from "./PermissionOverwrite";
import GuildChannel from "./GuildChannel";
import type Member from "./Member";
import Permission from "./Permission";
import type Client from "../Client";
import { type ChannelTypes } from "../Constants";
import TypedCollection from "../util/TypedCollection";
import type { EditPermissionOptions, RawCategoryChannel, RawOverwrite } from "../types/channels";
import type { JSONCategoryChannel } from "../types/json";
import Collection from "../util/Collection";
/** Represents a guild category channel. */
export default class CategoryChannel extends GuildChannel {
    /** The permission overwrites of this channel. */
    permissionOverwrites: TypedCollection<RawOverwrite, PermissionOverwrite>;
    /** The position of this channel on the sidebar. */
    position: number;
    type: ChannelTypes.GUILD_CATEGORY;
    constructor(data: RawCategoryChannel, client: Client);
    protected update(data: Partial<RawCategoryChannel>): void;
    /** The channels in this category. The returned collection is disposable. */
    get channels(): Collection<string, GuildChannel>;
    /**
     * Delete a permission overwrite on this channel.
     * @param overwriteID The ID of the permission overwrite to delete.
     * @param reason The reason for deleting the permission overwrite.
     */
    deletePermission(overwriteID: string, reason?: string): Promise<void>;
    /**
     * Edit a permission overwrite on this channel.
     * @param overwriteID The ID of the permission overwrite to edit.
     * @param options The options for editing the permission overwrite.
     */
    editPermission(overwriteID: string, options: EditPermissionOptions): Promise<void>;
    /**
     * Get the permissions of a member. If providing an id, the member must be cached.
     * @param member The member to get the permissions of.
     */
    permissionsOf(member: string | Member): Permission;
    toJSON(): JSONCategoryChannel;
}
