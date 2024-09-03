"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module Interaction */
const Base_1 = tslib_1.__importDefault(require("./Base"));
const Constants_1 = require("../Constants");
/** Represents an interaction. */
class Interaction extends Base_1.default {
    /** If this interaction has been acknowledged. */
    acknowledged;
    /** The application this interaction is for. */
    application;
    /** The ID of the application this interaction is for. */
    applicationID;
    /** The token of this interaction. */
    token;
    /** The [type](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-type) of this interaction. */
    type;
    /** Read-only property, always `1` */
    version;
    constructor(data, client) {
        super(data.id, client);
        this.acknowledged = false;
        this.application = client["_application"] && client.application.id === data.application_id ? client.application : undefined;
        this.applicationID = data.application_id;
        Object.defineProperty(this, "token", { value: data.token, enumerable: false });
        this.type = data.type;
        this.version = data.version;
    }
    static from(data, client) {
        switch (data.type) {
            case Constants_1.InteractionTypes.PING: {
                return new PingInteraction(data, client);
            }
            case Constants_1.InteractionTypes.APPLICATION_COMMAND: {
                return new CommandInteraction(data, client);
            }
            case Constants_1.InteractionTypes.MESSAGE_COMPONENT: {
                return new ComponentInteraction(data, client);
            }
            case Constants_1.InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE: {
                return new AutocompleteInteraction(data, client);
            }
            case Constants_1.InteractionTypes.MODAL_SUBMIT: {
                return new ModalSubmitInteraction(data, client);
            }
            default: {
                return new Interaction(data, client);
            }
        }
    }
    /** A type guard, checking if this interaction is an {@link AutocompleteInteraction | Autocomplete Interaction}. */
    isAutocompleteInteraction() {
        return this.type === Constants_1.InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE;
    }
    /** A type guard, checking if this interaction is a {@link CommandInteraction | Command Interaction}. */
    isCommandInteraction() {
        return this.type === Constants_1.InteractionTypes.APPLICATION_COMMAND;
    }
    /** A type guard, checking if this interaction is a {@link ComponentInteraction | Component Interaction}. */
    isComponentInteraction() {
        return this.type === Constants_1.InteractionTypes.MESSAGE_COMPONENT;
    }
    /** A type guard, checking if this interaction is a {@link ModalSubmitInteraction | Modal Submit Interaction}. */
    isModalSubmitInteraction() {
        return this.type === Constants_1.InteractionTypes.MODAL_SUBMIT;
    }
    /** A type guard, checking if this interaction is a {@link PingInteraction | Ping Interaction}. */
    isPingInteraction() {
        return this.type === Constants_1.InteractionTypes.PING;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            applicationID: this.applicationID,
            type: this.type,
            version: this.version
        };
    }
}
exports.default = Interaction;
// Yes this sucks, but it works. That's the important part. Circular imports are hell.
/* eslint-disable @typescript-eslint/no-var-requires, unicorn/prefer-module */
const AutocompleteInteraction = require("./AutocompleteInteraction").default;
const CommandInteraction = require("./CommandInteraction").default;
const ComponentInteraction = require("./ComponentInteraction").default;
const ModalSubmitInteraction = require("./ModalSubmitInteraction").default;
const PingInteraction = require("./PingInteraction").default;
/* eslint-enable @typescript-eslint/no-var-requires, unicorn/prefer-module */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvc3RydWN0dXJlcy9JbnRlcmFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQkFBMEI7QUFDMUIsMERBQTBCO0FBaUIxQiw0Q0FBZ0Q7QUFJaEQsaUNBQWlDO0FBQ2pDLE1BQXFCLFdBQVksU0FBUSxjQUFJO0lBQ3pDLGlEQUFpRDtJQUNqRCxZQUFZLENBQVU7SUFDdEIsK0NBQStDO0lBQy9DLFdBQVcsQ0FBcUI7SUFDaEMseURBQXlEO0lBQ3pELGFBQWEsQ0FBUztJQUN0QixxQ0FBcUM7SUFDckMsS0FBSyxDQUFVO0lBQ2YscUpBQXFKO0lBQ3JKLElBQUksQ0FBbUI7SUFDdkIscUNBQXFDO0lBQ3JDLE9BQU8sQ0FBSTtJQUNYLFlBQVksSUFBdUIsRUFBRSxNQUFjO1FBQy9DLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQzFCLElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUM1SCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDekMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDL0UsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztJ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