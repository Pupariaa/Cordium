/** @module VoiceChannel */
import TextableVoiceChannel from "./TextableVoiceChannel";
import type { ChannelTypes } from "../Constants";
import type Client from "../Client";
import type { RawVoiceChannel } from "../types/channels";
import type { JSONVoiceChannel } from "../types/json";
/** Represents a guild voice channel. */
export default class VoiceChannel extends TextableVoiceChannel<VoiceChannel> {
    /** The status of this voice channel. */
    status: string | null;
    type: ChannelTypes.GUILD_VOICE;
    constructor(data: RawVoiceChannel, client: Client);
    protected update(data: Partial<RawVoiceChannel>): void;
    /**
     * Set a voice status in this channel.
     * @param status The voice status to set.
     */
    setStatus(status: string | null): Promise<void>;
    toJSON(): JSONVoiceChannel;
}
