/** @module StageInstance */
import Base from "./Base";
import type StageChannel from "./StageChannel";
import type Guild from "./Guild";
import type GuildScheduledEvent from "./GuildScheduledEvent";
import type Client from "../Client";
import type { StageInstancePrivacyLevels } from "../Constants";
import type { JSONStageInstance } from "../types/json";
import type { RawStageInstance } from "../types/guilds";
/** Represents a stage instance. */
export default class StageInstance extends Base {
    private _cachedChannel?;
    private _cachedGuild?;
    private _cachedScheduledEvent?;
    /** The ID of the associated stage channel. */
    channelID: string;
    /** @deprecated If the stage channel is not discoverable. */
    discoverableDisabled: boolean;
    /** The id of the guild associated with this stage instance's stage channel. */
    guildID: string;
    /** The [privacy level](https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-privacy-level) of this stage instance. */
    privacyLevel: StageInstancePrivacyLevels;
    /** The id of the scheduled event for this stage instance, if applicable. */
    scheduledEventID: string | null;
    /** The topic of this stage instance. */
    topic: string;
    constructor(data: RawStageInstance, client: Client);
    protected update(data: Partial<RawStageInstance>): void;
    /** The associated stage channel. */
    get channel(): StageChannel | undefined;
    /** The guild of the associated stage channel. This will throw an error if the guild is not cached. */
    get guild(): Guild;
    /** The scheduled event for this stage instance, if applicable. */
    get scheduledEvent(): GuildScheduledEvent | null | undefined;
    toJSON(): JSONStageInstance;
}
