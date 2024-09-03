/** @module Client */
import RESTManager from "./rest/RESTManager";
import TypedCollection from "./util/TypedCollection";
import PrivateChannel from "./structures/PrivateChannel";
import GroupChannel from "./structures/GroupChannel";
import User from "./structures/User";
import Guild from "./structures/Guild";
import type { AnyChannel, RawGroupChannel, RawPrivateChannel } from "./types/channels";
import type { RawGuild, RawUnavailableGuild } from "./types/guilds";
import type { RawUser } from "./types/users";
import type { ClientInstanceOptions, ClientOptions } from "./types/client";
import TypedEmitter from "./util/TypedEmitter";
import type ClientApplication from "./structures/ClientApplication";
import ShardManager from "./gateway/ShardManager";
import type { BotActivity, SendStatuses } from "./types/gateway";
import UnavailableGuild from "./structures/UnavailableGuild";
import type ExtendedUser from "./structures/ExtendedUser";
import Util from "./util/Util";
import type { ClientEvents } from "./types/events";
import type { JoinVoiceChannelOptions } from "./types/voice";
import type OAuthHelper from "./rest/OAuthHelper";
import type { DiscordGatewayAdapterLibraryMethods, VoiceConnection } from "@discordjs/voice";
/** The primary class for interfacing with Discord. See {@link ClientEvents | Client Events} for a list of events. */
export default class Client<E extends ClientEvents = ClientEvents> extends TypedEmitter<E> {
    private _application?;
    private _user?;
    /** A key-value mapping of channel IDs to guild IDs. In most cases, every channel listed here should be cached in their respective guild's {@link Guild#channels | channels collection}. */
    channelGuildMap: Record<string, string>;
    groupChannels: TypedCollection<RawGroupChannel, GroupChannel>;
    guildShardMap: Record<string, number>;
    guilds: TypedCollection<RawGuild, Guild, [rest?: boolean]>;
    options: ClientInstanceOptions;
    privateChannels: TypedCollection<RawPrivateChannel, PrivateChannel>;
    ready: boolean;
    rest: RESTManager;
    shards: ShardManager;
    startTime: number;
    /** A key-value mapping of thread IDs to guild IDs. In most cases, every channel listed here should be cached in their respective guild's {@link Guild#threads | threads collection}. */
    threadGuildMap: Record<string, string>;
    unavailableGuilds: TypedCollection<RawUnavailableGuild, UnavailableGuild>;
    users: TypedCollection<RawUser, User>;
    util: Util;
    voiceAdapters: Map<string, DiscordGatewayAdapterLibraryMethods>;
    /**
     * @constructor
     * @param options The options to create the client with.
     */
    constructor(options?: ClientOptions);
    /** The client's partial application. This will throw an error if not using a gateway connection or no shard is READY. If using a client for rest only, consider enabling rest mode. */
    get application(): ClientApplication;
    get uptime(): number;
    /** The client's user. This will throw an error if not using a gateway connection or no shard is READY. If using a client for rest only, consider enabling rest mode. */
    get user(): ExtendedUser;
    /** The active voice connections of this client. */
    get voiceConnections(): Map<string, VoiceConnection>;
    /** Connect the client to Discord. */
    connect(): Promise<void>;
    /**
     * Disconnect all shards.
     * @param reconnect If shards should be reconnected. Defaults to {@link Types/Gateway~GatewayOptions#autoReconnect | GatewayOptions#autoReconnect}
     */
    disconnect(reconnect?: boolean): void;
    /**
     * Edit the client's status across all shards.
     * @param status The status.
     * @param activities An array of activities.
     */
    editStatus(status: SendStatuses, activities?: Array<BotActivity>): Promise<void>;
    /**
     * Get a channel from an ID. This will return undefined if the channel is not cached.
     * @param channelID The id of the channel.
     */
    getChannel<T extends AnyChannel = AnyChannel>(channelID: string): T | undefined;
    /**
     * Get a helper instance that can be used with a specific access token.
     * @param accessToken The access token. Must be prefixed with `Bearer `.
     */
    getOAuthHelper(accessToken: string): OAuthHelper;
    /**
     * Get a voice connection.
     * @param guildID The ID of the guild the voice channel belongs to.
     */
    getVoiceConnection(guildID: string): VoiceConnection | undefined;
    /**
     * Join a voice channel.
     * @param options The options to join the channel with.
     * */
    joinVoiceChannel(options: JoinVoiceChannelOptions): VoiceConnection;
    /**
     * Leave a voice channel.
     * @param guildID The ID of the guild the voice channel belongs to.
     */
    leaveVoiceChannel(guildID: string): void;
    /**
     * Initialize this client for rest only use. Currently, this sets both the `application` and `user` properties (if not already present), as would happen with a gateway connection.
     * @param fakeReady If the client should emit a ready event. Defaults to true.
     */
    restMode(fakeReady?: boolean): Promise<this>;
}
