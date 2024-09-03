/** @module PrivateThreadChannel */
import ThreadChannel from "./ThreadChannel";
import type { ChannelTypes } from "../Constants";
import type Client from "../Client";
import type { GetThreadMembersOptions, PrivateThreadMetadata, RawPrivateThreadChannel, ThreadMember } from "../types/channels";
import type { JSONPrivateThreadChannel } from "../types/json";
/** Represents a private thread channel.. */
export default class PrivateThreadChannel extends ThreadChannel<PrivateThreadChannel> {
    threadMetadata: PrivateThreadMetadata;
    type: ChannelTypes.PRIVATE_THREAD;
    constructor(data: RawPrivateThreadChannel, client: Client);
    /**
     * Get the members of this thread.
     * @param options The options for getting the thread members.
     */
    getThreadMembers(options?: GetThreadMembersOptions): Promise<Array<ThreadMember>>;
    toJSON(): JSONPrivateThreadChannel;
}
