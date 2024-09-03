/** @module TextChannel */
import type AnnouncementChannel from "./AnnouncementChannel";
import type PublicThreadChannel from "./PublicThreadChannel";
import type PrivateThreadChannel from "./PrivateThreadChannel";
import ThreadableChannel from "./ThreadableChannel";
import { ChannelTypes } from "../Constants";
import type Client from "../Client";
import type { ArchivedThreads, FollowedChannel, GetArchivedThreadsOptions, RawTextChannel } from "../types/channels";
import type { JSONTextChannel } from "../types/json";
/** Represents a guild text channel. */
export default class TextChannel extends ThreadableChannel<TextChannel, PublicThreadChannel | PrivateThreadChannel> {
    type: ChannelTypes.GUILD_TEXT;
    constructor(data: RawTextChannel, client: Client);
    /**
     * Convert this text channel to a announcement channel.
     */
    convert(): Promise<AnnouncementChannel>;
    /**
     * Follow an announcement channel to this channel.
     * @param webhookChannelID The ID of the channel to follow the announcement channel to.
     * @param reason The reason for following the announcement channel.
     */
    followAnnouncement(webhookChannelID: string, reason?: string): Promise<FollowedChannel>;
    /**
     * Get the private archived threads the current user has joined in this channel.
     * @param options The options for getting the joined private archived threads.
     */
    getJoinedPrivateArchivedThreads(options?: GetArchivedThreadsOptions): Promise<ArchivedThreads<PrivateThreadChannel>>;
    /**
     * Get the private archived threads in this channel.
     * @param options The options for getting the private archived threads.
     */
    getPrivateArchivedThreads(options?: GetArchivedThreadsOptions): Promise<ArchivedThreads<PrivateThreadChannel>>;
    toJSON(): JSONTextChannel;
}
