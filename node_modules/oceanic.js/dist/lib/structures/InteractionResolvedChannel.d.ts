/** @module InteractionResolvedChannel */
import type AnnouncementChannel from "./AnnouncementChannel";
import type TextChannel from "./TextChannel";
import Permission from "./Permission";
import Channel from "./Channel";
import type ForumChannel from "./ForumChannel";
import type Client from "../Client";
import type { RawInteractionResolvedChannel, ThreadMetadata, PrivateThreadMetadata } from "../types/channels";
import type { AnyImplementedChannel, ImplementedChannels } from "../types";
/** Represents a channel from an interaction option. This can be any guild channel, or a direct message. */
export default class InteractionResolvedChannel extends Channel {
    private _cachedCompleteChannel?;
    private _cachedParent?;
    /** The permissions the bot has in the channel. */
    appPermissions: Permission;
    /** The name of this channel. */
    name: string | null;
    /** The ID of the parent of this channel, if this represents a thread. */
    parentID: string | null;
    /** The [thread metadata](https://discord.com/developers/docs/resources/channel#thread-metadata-object-thread-metadata-structure) associated with this channel, if this represents a thread. */
    threadMetadata: ThreadMetadata | PrivateThreadMetadata | null;
    type: ImplementedChannels;
    constructor(data: RawInteractionResolvedChannel, client: Client);
    /** The complete channel this channel option represents, if it's cached. */
    get completeChannel(): AnyImplementedChannel | undefined;
    /** The parent of this channel, if this represents a thread. */
    get parent(): TextChannel | AnnouncementChannel | ForumChannel | null | undefined;
}
