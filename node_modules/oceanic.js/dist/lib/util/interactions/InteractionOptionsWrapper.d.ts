import type Member from "../../structures/Member";
import type Role from "../../structures/Role";
import type User from "../../structures/User";
import type { AnyImplementedChannel } from "../../types/channels";
import type { ApplicationCommandInteractionResolvedData, AutoCompleteFocusedOption, InteractionOptions, InteractionOptionsAttachment, InteractionOptionsBoolean, InteractionOptionsChannel, InteractionOptionsInteger, InteractionOptionsMentionable, InteractionOptionsNumber, InteractionOptionsRole, InteractionOptionsString, InteractionOptionsUser, InteractionOptionsWithValue, SubCommandArray } from "../../types/interactions";
import type Attachment from "../../structures/Attachment";
import type InteractionResolvedChannel from "../../structures/InteractionResolvedChannel";
/** A wrapper for interaction options. */
export default class InteractionOptionsWrapper {
    /** The raw options from Discord.  */
    raw: Array<InteractionOptions>;
    /** The resolved data for this options instance. */
    resolved: ApplicationCommandInteractionResolvedData | null;
    constructor(data: Array<InteractionOptions>, resolved: ApplicationCommandInteractionResolvedData | null);
    private _getOption;
    /**
     * Get an attachment option value.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present or the attachment cannot be found.
     */
    getAttachment(name: string, required?: false): Attachment | undefined;
    getAttachment(name: string, required: true): Attachment;
    /**
     * Get an attachment option.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getAttachmentOption(name: string, required?: false): InteractionOptionsAttachment | undefined;
    getAttachmentOption(name: string, required: true): InteractionOptionsAttachment;
    /**
     * Get a boolean option value.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getBoolean(name: string, required?: false): boolean | undefined;
    getBoolean(name: string, required: true): boolean;
    /**
     * Get a boolean option.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getBooleanOption(name: string, required?: false): InteractionOptionsBoolean | undefined;
    getBooleanOption(name: string, required: true): InteractionOptionsBoolean;
    /**
     * Get a channel option value.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present or the channel cannot be found.
     */
    getChannel(name: string, required?: false): InteractionResolvedChannel | undefined;
    getChannel(name: string, required: true): InteractionResolvedChannel;
    /**
     * Get a channel option.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getChannelOption(name: string, required?: false): InteractionOptionsChannel | undefined;
    getChannelOption(name: string, required: true): InteractionOptionsChannel;
    /**
     * Get a channel option's complete channel. This will only succeed if the channel is cached. If the channel is private and isn't cached, an `InteractionResolvedChannel` instance will still be returned.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present or the channel cannot be found.
     */
    getCompleteChannel<T extends AnyImplementedChannel | InteractionResolvedChannel = AnyImplementedChannel | InteractionResolvedChannel>(name: string, required?: false): T | undefined;
    getCompleteChannel<T extends AnyImplementedChannel | InteractionResolvedChannel = AnyImplementedChannel | InteractionResolvedChannel>(name: string, required: true): T;
    /**
     * Get the focused option (in an autocomplete interaction).
     * @param required If true, an error will be thrown if no focused option is present.
     */
    getFocused<T extends AutoCompleteFocusedOption = AutoCompleteFocusedOption>(required?: false): T | undefined;
    getFocused<T extends AutoCompleteFocusedOption = AutoCompleteFocusedOption>(required: true): T;
    /**
     * Get an integer option value.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getInteger(name: string, required?: false): number | undefined;
    getInteger(name: string, required: true): number;
    /**
     * Get an integer option.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getIntegerOption(name: string, required?: false): InteractionOptionsInteger | undefined;
    getIntegerOption(name: string, required: true): InteractionOptionsInteger;
    /**
     * Get a user option value (as a member).
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present, or if the member cannot be found.
     */
    getMember(name: string, required?: false): Member | undefined;
    getMember(name: string, required: true): Member;
    /**
     * Get a mentionable option value (user, role).
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present, or if the value cannot be found.
     */
    getMentionable<T extends User | Role = User | Role>(name: string, required?: false): T | undefined;
    getMentionable<T extends User | Role = User | Role>(name: string, required: true): T;
    /**
     * Get a mentionable option.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getMentionableOption(name: string, required?: false): InteractionOptionsMentionable | undefined;
    getMentionableOption(name: string, required: true): InteractionOptionsMentionable;
    /**
     * Get a number option value.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getNumber(name: string, required?: false): number | undefined;
    getNumber(name: string, required: true): number;
    /**
     * Get a number option.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getNumberOption(name: string, required?: false): InteractionOptionsNumber | undefined;
    getNumberOption(name: string, required: true): InteractionOptionsNumber;
    /** Get the options received in this interaction, excluding subcommands and subcommand groups. */
    getOptions(): Array<InteractionOptionsWithValue>;
    /**
     * Get a role option value.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present, or if the role cannot be found.
     */
    getRole(name: string, required?: false): Role | undefined;
    getRole(name: string, required: true): Role;
    /**
     * Get a role option.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getRoleOption(name: string, required?: false): InteractionOptionsRole | undefined;
    getRoleOption(name: string, required: true): InteractionOptionsRole;
    /**
     * Get a string option value.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getString<T extends string = string>(name: string, required?: false): T | undefined;
    getString<T extends string = string>(name: string, required: true): T;
    /**
     * Get a string option.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getStringOption(name: string, required?: false): InteractionOptionsString | undefined;
    getStringOption(name: string, required: true): InteractionOptionsString;
    /**
     * If present, returns the top level subcommand. This will return an array of the subcommand name, and subcommand group name, if applicable.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getSubCommand<T extends SubCommandArray = SubCommandArray>(required?: false): T | undefined;
    getSubCommand<T extends SubCommandArray = SubCommandArray>(required: true): T;
    /**
     * Get a user option value.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present, or if the user cannot be found.
     */
    getUser(name: string, required?: false): User | undefined;
    getUser(name: string, required: true): User;
    /**
     * Get a user option.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getUserOption(name: string, required?: false): InteractionOptionsUser | undefined;
    getUserOption(name: string, required: true): InteractionOptionsUser;
}
