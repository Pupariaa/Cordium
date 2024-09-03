import type { ModalSubmitComponents, ModalSubmitComponentsActionRow, ModalSubmitTextInputComponent } from "../../types/interactions";
/** A wrapper for interaction components. */
export default class ModalSubmitInteractionComponentsWrapper {
    /** The raw components from Discord.  */
    raw: Array<ModalSubmitComponentsActionRow>;
    constructor(data: Array<ModalSubmitComponentsActionRow>);
    private _getComponent;
    /** Get the components in this interaction. */
    getComponents(): Array<ModalSubmitComponents>;
    /**
     * Get a string option value.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getTextInput<T extends string = string>(name: string, required?: false): T | undefined;
    getTextInput<T extends string = string>(name: string, required: true): T;
    /**
     * Get a string option.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getTextInputComponent(name: string, required?: false): ModalSubmitTextInputComponent | undefined;
    getTextInputComponent(name: string, required: true): ModalSubmitTextInputComponent;
}
