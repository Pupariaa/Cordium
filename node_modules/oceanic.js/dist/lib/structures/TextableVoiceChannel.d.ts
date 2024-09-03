/** @module TextableVoiceChannel */
import Member from "./Member";
import type CategoryChannel from "./CategoryChannel";
import TextableChannel from "./TextableChannel";
import type VoiceState from "./VoiceState";
import type { VideoQualityModes } from "../Constants";
import type Client from "../Client";
import TypedCollection from "../util/TypedCollection";
import type { AnyVoiceChannel, RawStageChannel, RawVoiceChannel, VoiceChannels } from "../types/channels";
import type { JSONTextableVoiceChannel } from "../types/json";
import type { RawMember } from "../types/guilds";
import type { JoinVoiceChannelOptions } from "../types/voice";
import type { VoiceConnection } from "@discordjs/voice";
/** Represents a textable voice channel. */
export default class TextableVoiceChannel<T extends AnyVoiceChannel = AnyVoiceChannel> extends TextableChannel<T> {
    /** The bitrate of the stage channel. */
    bitrate: number;
    /** The id of the voice region of the channel, `null` is automatic. */
    rtcRegion: string | null;
    type: VoiceChannels;
    /** The maximum number of members in this voice channel, `0` is unlimited. */
    userLimit: number;
    /** The [video quality mode](https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes) of this channel. */
    videoQualityMode: VideoQualityModes;
    voiceMembers: TypedCollection<RawMember, Member, [guildID: string]>;
    constructor(data: RawVoiceChannel | RawStageChannel, client: Client);
    protected update(data: Partial<RawVoiceChannel | RawStageChannel>): void;
    get parent(): CategoryChannel | null | undefined;
    /** The voice states related to this channel. */
    get voiceStates(): Array<VoiceState<T>>;
    /**
     * Join this stage channel.
     * @param options The options to join the channel with.
     */
    join(options: Omit<JoinVoiceChannelOptions, "guildID" | "channelID" | "voiceAdapterCreator">): VoiceConnection;
    /** Leave this stage channel. */
    leave(): void;
    toJSON(): JSONTextableVoiceChannel;
}
