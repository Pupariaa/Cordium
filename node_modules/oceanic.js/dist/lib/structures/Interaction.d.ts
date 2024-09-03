/** @module Interaction */
import Base from "./Base";
import type ClientApplication from "./ClientApplication";
import type ICommandInteraction from "./CommandInteraction";
import type IModalSubmitInteraction from "./ModalSubmitInteraction";
import type IPingInteraction from "./PingInteraction";
import type IComponentInteraction from "./ComponentInteraction";
import type IAutocompleteInteraction from "./AutocompleteInteraction";
import type Client from "../Client";
import type { AnyInteraction, AnyRawInteraction, RawInteraction } from "../types/interactions";
import { InteractionTypes } from "../Constants";
import type { JSONInteraction } from "../types/json";
/** Represents an interaction. */
export default class Interaction extends Base {
    /** If this interaction has been acknowledged. */
    acknowledged: boolean;
    /** The application this interaction is for. */
    application?: ClientApplication;
    /** The ID of the application this interaction is for. */
    applicationID: string;
    /** The token of this interaction. */
    token: string;
    /** The [type](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-type) of this interaction. */
    type: InteractionTypes;
    /** Read-only property, always `1` */
    version: 1;
    constructor(data: AnyRawInteraction, client: Client);
    static from<T extends AnyInteraction = AnyInteraction>(data: RawInteraction, client: Client): T;
    /** A type guard, checking if this interaction is an {@link AutocompleteInteraction | Autocomplete Interaction}. */
    isAutocompleteInteraction(): this is IAutocompleteInteraction;
    /** A type guard, checking if this interaction is a {@link CommandInteraction | Command Interaction}. */
    isCommandInteraction(): this is ICommandInteraction;
    /** A type guard, checking if this interaction is a {@link ComponentInteraction | Component Interaction}. */
    isComponentInteraction(): this is IComponentInteraction;
    /** A type guard, checking if this interaction is a {@link ModalSubmitInteraction | Modal Submit Interaction}. */
    isModalSubmitInteraction(): this is IModalSubmitInteraction;
    /** A type guard, checking if this interaction is a {@link PingInteraction | Ping Interaction}. */
    isPingInteraction(): this is IPingInteraction;
    toJSON(): JSONInteraction;
}
