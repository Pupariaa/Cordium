/** @module StageChannel */
import type StageInstance from "./StageInstance";
import TextableVoiceChannel from "./TextableVoiceChannel";
import type { ChannelTypes } from "../Constants";
import type Client from "../Client";
import type { RawStageChannel } from "../types/channels";
import type { JSONStageChannel } from "../types/json";
import type { CreateStageInstanceOptions, EditStageInstanceOptions } from "../types/guilds";
/** Represents a guild stage channel. */
export default class StageChannel extends TextableVoiceChannel<StageChannel> {
    type: ChannelTypes.GUILD_STAGE_VOICE;
    constructor(data: RawStageChannel, client: Client);
    /**
     * Create a stage instance on this channel.
     * @param options The options for creating the stage instance.
     */
    createStageInstance(options: CreateStageInstanceOptions): Promise<StageInstance>;
    /**
     * Delete the stage instance on this channel.
     * @param reason The reason for deleting the stage instance.
     */
    deleteStageInstance(reason?: string): Promise<void>;
    /**
     * Edit the stage instance on this channel.
     * @param options The options for editing the stage instance.
     */
    editStageInstance(options: EditStageInstanceOptions): Promise<StageInstance>;
    /**
     * Get the stage instance associated with this channel.
     */
    getStageInstance(): Promise<StageInstance>;
    toJSON(): JSONStageChannel;
}
