/** @module GuildChannel */
import Channel from "./Channel";
import type Guild from "./Guild";
import type CategoryChannel from "./CategoryChannel";
import type TextChannel from "./TextChannel";
import type AnnouncementChannel from "./AnnouncementChannel";
import type ForumChannel from "./ForumChannel";
import type Client from "../Client";
import type { EditChannelOptionsMap, GuildChannels, RawGuildChannel } from "../types/channels";
import type { JSONGuildChannel } from "../types/json";
/** Represents a guild channel. */
export default class GuildChannel extends Channel {
    private _cachedGuild?;
    private _cachedParent?;
    /** The id of the guild this channel is in. */
    guildID: string;
    /** The name of this channel. */
    name: string;
    /** The ID of the parent of this channel, if applicable. */
    parentID: string | null;
    type: GuildChannels;
    constructor(data: RawGuildChannel, client: Client);
    protected update(data: Partial<RawGuildChannel>): void;
    /** The guild associated with this channel. This will throw an error if the guild is not cached. */
    get guild(): Guild;
    /** The parent of this channel, if applicable. This will be a text/announcement/forum channel if we're in a thread, category otherwise. */
    get parent(): TextChannel | AnnouncementChannel | CategoryChannel | ForumChannel | null | undefined;
    /**
     * Edit this channel.
     * @param options The options for editing the channel.
     */
    edit(options: EditChannelOptionsMap[this["type"]]): Promise<this>;
    toJSON(): JSONGuildChannel;
}
