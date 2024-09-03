/** @module MediaChannel */
import ThreadOnlyChannel from "./ThreadOnlyChannel";
import type Client from "../Client";
import type { ChannelTypes } from "../Constants";
import type { JSONMediaChannel, RawMediaChannel } from "../types";
/** Represents a media channel. */
export default class MediaChannel extends ThreadOnlyChannel {
    type: ChannelTypes.GUILD_MEDIA;
    constructor(data: RawMediaChannel, client: Client);
    toJSON(): JSONMediaChannel;
}
