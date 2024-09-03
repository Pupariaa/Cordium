/** @module PrivateChannel */
import Channel from "./Channel";
import type User from "./User";
import Message from "./Message";
import type { ChannelTypes } from "../Constants";
import type Client from "../Client";
import type { CreateMessageOptions, EditMessageOptions, GetChannelMessagesOptions, GetReactionsOptions, RawMessage, RawPrivateChannel } from "../types/channels";
import TypedCollection from "../util/TypedCollection";
import type { JSONPrivateChannel } from "../types/json";
/** Represents a direct message with a user. */
export default class PrivateChannel extends Channel {
    /** The last message sent in this channel. This will only be present if a message has been sent within the current session. */
    lastMessage?: Message<this> | null;
    /** The ID of last message sent in this channel. */
    lastMessageID: string | null;
    /** The cached messages in this channel. */
    messages: TypedCollection<RawMessage, Message<this>>;
    /** The other user in this direct message. */
    recipient: User;
    type: ChannelTypes.DM;
    constructor(data: RawPrivateChannel, client: Client);
    protected update(data: Partial<RawPrivateChannel>): void;
    /**
     * Create a message in this channel.
     * @param options The options for creating the message.
     */
    createMessage(options: CreateMessageOptions): Promise<Message<this>>;
    /**
     * Add a reaction to a message in this channel.
     * @param messageID The ID of the message to add a reaction to.
     * @param emoji The reaction to add to the message. `name:id` for custom emojis, and the unicode codepoint for default emojis.
     */
    createReaction(messageID: string, emoji: string): Promise<void>;
    /**
     * Delete a message in this channel.
     * @param messageID The ID of the message to delete.
     * @param reason The reason for deleting the message.
     */
    deleteMessage(messageID: string, reason?: string): Promise<void>;
    /**
     * Remove a reaction from a message in this channel.
     * @param messageID The ID of the message to remove a reaction from.
     * @param emoji The reaction to remove from the message. `name:id` for custom emojis, and the unicode codepoint for default emojis.
     */
    deleteReaction(messageID: string, emoji: string): Promise<void>;
    /**
     * Edit a message in this channel.
     * @param messageID The ID of the message to edit.
     * @param options The options for editing the message.
     */
    editMessage(messageID: string, options: EditMessageOptions): Promise<Message<this>>;
    /**
     * Get a message in this channel.
     * @param messageID The ID of the message to get.
     */
    getMessage(messageID: string): Promise<Message<this>>;
    /**
     * Get messages in this channel.
     * @param options The options for getting the messages. `before`, `after`, and `around `All are mutually exclusive.
     */
    getMessages(options?: GetChannelMessagesOptions): Promise<Array<Message<this>>>;
    /**
     * Get the pinned messages in this channel.
     */
    getPinnedMessages(): Promise<Array<Message<this>>>;
    /**
     * Get the users who reacted with a specific emoji on a message.
     * @param messageID The iIDd of the message to get reactions from.
     * @param emoji The reaction to remove from the message. `name:id` for custom emojis, and the unicode codepoint for default emojis.
     * @param options The options for getting the reactions.
     */
    getReactions(messageID: string, emoji: string, options?: GetReactionsOptions): Promise<Array<User>>;
    /**
     * Pin a message in this channel.
     * @param messageID The ID of the message to pin.
     * @param reason The reason for pinning the message.
     */
    pinMessage(messageID: string, reason?: string): Promise<void>;
    /**
     * Show a typing indicator in this channel.
     */
    sendTyping(): Promise<void>;
    toJSON(): JSONPrivateChannel;
    /**
     * Unpin a message in this channel.
     * @param messageID The ID of the message to unpin.
     * @param reason The ID for unpinning the message.
     */
    unpinMessage(messageID: string, reason?: string): Promise<void>;
}
