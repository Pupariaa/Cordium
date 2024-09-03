/** @module PublicThreadChannel */
import ThreadChannel from "./ThreadChannel";
import type { ChannelTypes } from "../Constants";
import type Client from "../Client";
import type { GetThreadMembersOptions, RawPublicThreadChannel, ThreadMember, ThreadMetadata } from "../types/channels";
import type { JSONPublicThreadChannel } from "../types/json";
/** Represents a public thread channel. */
export default class PublicThreadChannel extends ThreadChannel<PublicThreadChannel> {
    /** the IDs of the set of tags that have been applied to this thread. Forum channel threads only.  */
    appliedTags: Array<string>;
    threadMetadata: ThreadMetadata;
    type: ChannelTypes.PUBLIC_THREAD;
    constructor(data: RawPublicThreadChannel, client: Client);
    protected update(data: Partial<RawPublicThreadChannel>): void;
    /**
     * Get the members of this thread.
     * @param options The options for getting the thread members.
     */
    getThreadMembers(options?: GetThreadMembersOptions): Promise<Array<ThreadMember>>;
    toJSON(): JSONPublicThreadChannel;
}
