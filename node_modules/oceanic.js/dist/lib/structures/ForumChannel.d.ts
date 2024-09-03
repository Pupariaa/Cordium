/** @module ForumChannel */
import ThreadOnlyChannel from "./ThreadOnlyChannel";
import type Client from "../Client";
import type { ChannelTypes } from "../Constants";
import type { JSONForumChannel, RawForumChannel } from "../types";
/** Represents a thread forum channel. */
export default class ForumChannel extends ThreadOnlyChannel {
    type: ChannelTypes.GUILD_FORUM;
    constructor(data: RawForumChannel, client: Client);
    toJSON(): JSONForumChannel;
}
