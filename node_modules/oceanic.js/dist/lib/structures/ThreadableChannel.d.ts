/** @module TextableChannel */
import TextableChannel from "./TextableChannel";
import type PrivateThreadChannel from "./PrivateThreadChannel";
import type { ChannelTypes, ThreadAutoArchiveDuration } from "../Constants";
import type Client from "../Client";
import type { RawAnnouncementChannel, RawTextChannel } from "../types/channels";
import type { AnyTextableGuildChannel, AnyThreadChannel, ArchivedThreads, GetArchivedThreadsOptions, JSONThreadableChannel, StartThreadFromMessageOptions, StartThreadWithoutMessageOptions } from "../types";
import Collection from "../util/Collection";
/** Represents a guild textable channel. */
export default class ThreadableChannel<TC extends AnyTextableGuildChannel = AnyTextableGuildChannel, TH extends AnyThreadChannel = AnyThreadChannel> extends TextableChannel<TC> {
    /** The default auto archive duration for threads created in this channel. */
    defaultAutoArchiveDuration: ThreadAutoArchiveDuration;
    /** The threads in this channel. */
    type: ChannelTypes.GUILD_TEXT | ChannelTypes.GUILD_ANNOUNCEMENT;
    constructor(data: RawTextChannel | RawAnnouncementChannel, client: Client);
    protected update(data: Partial<RawTextChannel | RawAnnouncementChannel>): void;
    /** The threads in this channel. The returned collection is disposable. */
    get threads(): Collection<string, TH>;
    /**
     * Get the public archived threads in this channel.
     * @param options The options for getting the public archived threads.
     */
    getPublicArchivedThreads(options?: GetArchivedThreadsOptions): Promise<ArchivedThreads<Exclude<TH, PrivateThreadChannel>>>;
    /**
     * Create a thread from an existing message in this channel.
     * @param messageID The ID of the message to create a thread from.
     * @param options The options for creating the thread.
     */
    startThreadFromMessage(messageID: string, options: StartThreadFromMessageOptions): Promise<TH>;
    /**
     * Create a thread without an existing message in this channel.
     * @param options The options for creating the thread.
     */
    startThreadWithoutMessage(options: StartThreadWithoutMessageOptions): Promise<TH>;
    toJSON(): JSONThreadableChannel;
}
