/** @module VoiceState */
import Base from "./Base";
import type Member from "./Member";
import type Guild from "./Guild";
import type User from "./User";
import type Client from "../Client";
import type { RawVoiceState } from "../types/voice";
import type { JSONVoiceState } from "../types/json";
import type { AnyVoiceChannel } from "../types";
/** Represents a guild member's voice state. */
export default class VoiceState<T extends AnyVoiceChannel = AnyVoiceChannel> extends Base {
    private _cachedChannel?;
    private _cachedGuild?;
    private _cachedMember?;
    private _cachedUser?;
    /** The ID of the channel the user is connected to. */
    channelID: string | null;
    /** If the associated member is deafened. */
    deaf: boolean;
    /** The ID of the guild this voice state is a part of. */
    guildID: string;
    /** If the associated member is muted. */
    mute: boolean;
    /** The time at which the associated member requested to speak. */
    requestToSpeakTimestamp: Date | null;
    /** If the associated member is self deafened. */
    selfDeaf: boolean;
    /** If the associated member is self muted. */
    selfMute: boolean;
    /** If the associated member is streaming. */
    selfStream: boolean;
    /** If the associated member is has their camera on. */
    selfVideo: boolean;
    /** The id of the associated member's voice session. */
    sessionID: string;
    /** If the associated member is suppressed. */
    suppress: boolean;
    /** The ID of the user associated with this voice state. */
    userID: string;
    constructor(data: RawVoiceState, client: Client);
    protected update(data: Partial<RawVoiceState>): void;
    /** The channel the user is connected to. */
    get channel(): T | null | undefined;
    /** The guild this voice state is a part of. This will throw an error if the guild is not cached. */
    get guild(): Guild;
    /** The member associated with this voice state. */
    get member(): Member | undefined;
    /** TThe user associated with this voice state. */
    get user(): User | undefined;
    toJSON(): JSONVoiceState;
}
