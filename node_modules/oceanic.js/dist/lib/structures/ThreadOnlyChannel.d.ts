/** @module ThreadOnlyChannel */
import GuildChannel from "./GuildChannel";
import PermissionOverwrite from "./PermissionOverwrite";
import type PublicThreadChannel from "./PublicThreadChannel";
import type Invite from "./Invite";
import type Member from "./Member";
import Permission from "./Permission";
import type CategoryChannel from "./CategoryChannel";
import type Webhook from "./Webhook";
import type Client from "../Client";
import type { ArchivedThreads, CreateInviteOptions, EditPermissionOptions, ForumEmoji, ForumTag, GetArchivedThreadsOptions, RawOverwrite, StartThreadInThreadOnlyChannelOptions } from "../types/channels";
import type { JSONThreadOnlyChannel } from "../types/json";
import TypedCollection from "../util/TypedCollection";
import { type SortOrderTypes, type ForumLayoutTypes, type ThreadAutoArchiveDuration } from "../Constants";
import type { CreateWebhookOptions, RawThreadOnlyChannel, ThreadOnlyChannels } from "../types";
import Collection from "../util/Collection";
/** Represents a thread only channel. */
export default class ThreadOnlyChannel extends GuildChannel {
    /** The usable tags for threads. */
    availableTags: Array<ForumTag>;
    /** The default auto archive duration for threads. */
    defaultAutoArchiveDuration: ThreadAutoArchiveDuration;
    /** The default forum layout used to display threads. */
    defaultForumLayout: ForumLayoutTypes;
    /** The default reaction emoji for threads. */
    defaultReactionEmoji: ForumEmoji | null;
    /** The default sort order mode used to sort threads. */
    defaultSortOrder: SortOrderTypes | null;
    /** The default amount of seconds between non-moderators sending messages in threads. */
    defaultThreadRateLimitPerUser: number;
    /** The flags for this channel, see {@link Constants.ChannelFlags | ChannelFlags}. */
    flags: number;
    /** The ID of most recently created thread. */
    lastThreadID: string | null;
    /** If this channel is age gated. */
    nsfw: boolean;
    /** The permission overwrites of this channel. */
    permissionOverwrites: TypedCollection<RawOverwrite, PermissionOverwrite>;
    /** The position of this channel on the sidebar. */
    position: number;
    /** The amount of seconds between non-moderators creating threads. */
    rateLimitPerUser: number;
    /** The `guidelines` of this forum channel. */
    topic: string | null;
    type: ThreadOnlyChannels;
    constructor(data: RawThreadOnlyChannel, client: Client);
    protected update(data: Partial<RawThreadOnlyChannel>): void;
    /** The most recently created thread. */
    get lastThread(): PublicThreadChannel | null;
    get parent(): CategoryChannel | null | undefined;
    /** The threads in this channel. The returned collection is disposable. */
    get threads(): Collection<string, PublicThreadChannel>;
    /**
     * Create an invite for this channel. If the guild is not a `COMMUNITY` server, invites can only be made to last 30 days.
     * @param options The options for the invite.
     */
    createInvite(options: CreateInviteOptions): Promise<Invite<"withMetadata", this>>;
    /**
     * Create a webhook in this channel.
     * @param options The options to create the webhook with.
     */
    createWebhook(options: CreateWebhookOptions): Promise<Webhook>;
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
     * Get the invites of this channel.
     */
    getInvites(): Promise<Array<Invite<"withMetadata", this>>>;
    /**
     * Get the public archived threads in this channel.
     * @param options The options for getting the public archived threads.
     */
    getPublicArchivedThreads(options?: GetArchivedThreadsOptions): Promise<ArchivedThreads<PublicThreadChannel>>;
    /**
     * Get the webhooks in this channel.
     */
    getWebhooks(): Promise<Array<Webhook>>;
    /**
     * Get the permissions of a member.  If providing an id, the member must be cached.
     * @param member The member to get the permissions of.
     */
    permissionsOf(member: string | Member): Permission;
    /**
     * Create a thread in this forum channel.
     * @param options The options for starting the thread.
     */
    startThread(options: StartThreadInThreadOnlyChannelOptions): Promise<PublicThreadChannel>;
    toJSON(): JSONThreadOnlyChannel;
}
