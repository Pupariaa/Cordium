/** @module AnnouncementChannel */
import type TextChannel from "./TextChannel";
import type CategoryChannel from "./CategoryChannel";
import type AnnouncementThreadChannel from "./AnnouncementThreadChannel";
import type Message from "./Message";
import ThreadableChannel from "./ThreadableChannel";
import { ChannelTypes } from "../Constants";
import type Client from "../Client";
import type { FollowedChannel, RawAnnouncementChannel } from "../types/channels";
import type { JSONAnnouncementChannel } from "../types/json";
/**
 * Represents a guild announcement channel.
 * @mergeTarget AnnouncementChannel
 */
export default class AnnouncementChannel extends ThreadableChannel<AnnouncementChannel, AnnouncementThreadChannel> {
    /** The amount of seconds between non-moderators sending messages. Always zero in announcement channels. */
    rateLimitPerUser: 0;
    type: ChannelTypes.GUILD_ANNOUNCEMENT;
    constructor(data: RawAnnouncementChannel, client: Client);
    get parent(): CategoryChannel | null | undefined;
    /**
     * Convert this announcement channel to a text channel.
     */
    convert(): Promise<TextChannel>;
    /**
     * Crosspost a message in this channel.
     * @param messageID The ID of the message to crosspost.
     */
    crosspostMessage(messageID: string): Promise<Message<this>>;
    /**
     * Follow this announcement channel.
     * @param webhookChannelID The ID of the channel crossposted messages should be sent to. The client must have the `MANAGE_WEBHOOKS` permission in this channel.
     * @param reason The reason for following this channel.
     */
    follow(webhookChannelID: string, reason?: string): Promise<FollowedChannel>;
    toJSON(): JSONAnnouncementChannel;
}
