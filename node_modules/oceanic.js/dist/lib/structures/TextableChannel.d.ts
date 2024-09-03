/** @module TextableChannel */
import GuildChannel from "./GuildChannel";
import PermissionOverwrite from "./PermissionOverwrite";
import Message from "./Message";
import type Invite from "./Invite";
import type CategoryChannel from "./CategoryChannel";
import type Member from "./Member";
import Permission from "./Permission";
import type User from "./User";
import type Webhook from "./Webhook";
import type Client from "../Client";
import TypedCollection from "../util/TypedCollection";
import type { CreateInviteOptions, CreateMessageOptions, EditMessageOptions, EditPermissionOptions, GetChannelMessagesOptions, GetReactionsOptions, RawMessage, RawAnnouncementChannel, RawOverwrite, RawTextChannel, PurgeOptions } from "../types/channels";
import type { JSONTextableChannel } from "../types/json";
import type { AnyTextableGuildChannel, CreateWebhookOptions, RawStageChannel, RawVoiceChannel } from "../types";
/** Represents a guild textable channel. */
export default class TextableChannel<T extends AnyTextableGuildChannel = AnyTextableGuildChannel> extends GuildChannel {
    /** The last message sent in this channel. This will only be present if a message has been sent within the current session. */
    lastMessage?: Message<T> | null;
    /** The ID of last message sent in this channel. */
    lastMessageID: string | null;
    /** The cached messages in this channel. */
    messages: TypedCollection<RawMessage, Message<T>>;
    /** If this channel is age gated. */
    nsfw: boolean;
    /** The permission overwrites of this channel. */
    permissionOverwrites: TypedCollection<RawOverwrite, PermissionOverwrite>;
    /** The position of this channel on the sidebar. */
    position: number;
    /** The amount of seconds between non-moderators sending messages. */
    rateLimitPerUser: number;
    /** The topic of the channel. */
    topic: string | null;
    type: T["type"];
    constructor(data: RawTextChannel | RawAnnouncementChannel | RawVoiceChannel | RawStageChannel, client: Client);
    protected update(data: Partial<RawTextChannel | RawAnnouncementChannel | RawVoiceChannel | RawStageChannel>): void;
    get parent(): CategoryChannel | undefined | null;
    /**
     * Create an invite for this channel. If the guild is not a `COMMUNITY` server, invites can only be made to last 30 days.
     * @param options The options for the invite.
     */
    createInvite(options: CreateInviteOptions): Promise<Invite<"withMetadata", T>>;
    /**
     * Create a message in this channel.
     * @param options The options for the message.
     */
    createMessage(options: CreateMessageOptions): Promise<Message<T>>;
    /**
     * Add a reaction to a message in this channel.
     * @param messageID The ID of the message to add a reaction to.
     * @param emoji The reaction to add to the message. `name:id` for custom emojis, and the unicode codepoint for default emojis.
     */
    createReaction(messageID: string, emoji: string): Promise<void>;
    /**
     * Create a webhook in this channel.
     * @param options The options to create the webhook with.
     */
    createWebhook(options: CreateWebhookOptions): Promise<Webhook>;
    /**
     * Delete a message in this channel.
     * @param messageID The ID of the message to delete.
     * @param reason The reason for deleting the message.
     */
    deleteMessage(messageID: string, reason?: string): Promise<void>;
    /**
     * Bulk delete messages in this channel.
     * @param messageIDs The IDs of the messages to delete. Any duplicates or messages older than two weeks will cause an error.
     * @param reason The reason for deleting the messages.
     */
    deleteMessages(messageIDs: Array<string>, reason?: string): Promise<number>;
    /**
     * Delete a permission overwrite on this channel.
     * @param overwriteID The ID of the permission overwrite to delete.
     * @param reason The reason for deleting the permission overwrite.
     */
    deletePermission(overwriteID: string, reason?: string): Promise<void>;
    /**
     * Remove a reaction from a message in this channel.
     * @param messageID The ID of the message to remove a reaction from.
     * @param emoji The reaction to remove from the message. `name:id` for custom emojis, and the unicode codepoint for default emojis.
     * @param user The user to remove the reaction from, `@me` for the current user (default).
     */
    deleteReaction(messageID: string, emoji: string, user?: string): Promise<void>;
    /**
     * Remove all, or a specific emoji's reactions from a message in this channel.
     * @param messageID The ID of the message to remove reactions from.
     * @param emoji The reaction to remove from the message. `name:id` for custom emojis, and the unicode codepoint for default emojis. Omit to remove all reactions.
     */
    deleteReactions(messageID: string, emoji?: string): Promise<void>;
    /**
     * Edit a message in this channel.
     * @param messageID The ID of the message to edit.
     * @param options The options for editing the message.
     */
    editMessage(messageID: string, options: EditMessageOptions): Promise<Message<T>>;
    /**
     * Edit a permission overwrite on this channel.
     * @param overwriteID The ID of the permission overwrite to edit.
     * @param options The options for editing the permission overwrite.
     */
    editPermission(overwriteID: string, options: EditPermissionOptions): Promise<void>;
    /**
     * Get the invites of this channel.
     */
    getInvites(): Promise<Array<Invite<"withMetadata", T>>>;
    /**
     * Get a message in this channel.
     * @param messageID The ID of the message to get.
     */
    getMessage(messageID: string): Promise<Message<T>>;
    /**
     * Get messages in this channel.
     * @param options The options for getting the messages. `before`, `after`, and `around `All are mutually exclusive.
     */
    getMessages(options?: GetChannelMessagesOptions): Promise<Array<Message<T>>>;
    /**
     * Get the pinned messages in this channel.
     */
    getPinnedMessages(): Promise<Array<Message<T>>>;
    /**
     * Get the users who reacted with a specific emoji on a message in this channel.
     * @param messageID The ID of the message to get reactions from.
     * @param emoji The reaction to remove from the message. `name:id` for custom emojis, and the unicode codepoint for default emojis.
     * @param options The options for getting the reactions.
     */
    getReactions(messageID: string, emoji: string, options?: GetReactionsOptions): Promise<Array<User>>;
    /**
     * Get the webhooks in this channel.
     */
    getWebhooks(): Promise<Array<Webhook>>;
    /**
     * Get the permissions of a member. If providing an id, the member must be cached.
     * @param member The member to get the permissions of.
     */
    permissionsOf(member: string | Member): Permission;
    /**
     * Pin a message in this channel.
     * @param messageID The ID of the message to pin.
     * @param reason The reason for pinning the message.
     */
    pinMessage(messageID: string, reason?: string): Promise<void>;
    /**
     * Purge an amount of messages from this channel.
     * @param options The options to purge. `before`, `after`, and `around `All are mutually exclusive.
     */
    purge(options: PurgeOptions<T>): Promise<number>;
    /**
     * Show a typing indicator in this channel. How long users see this varies from client to client.
     */
    sendTyping(): Promise<void>;
    toJSON(): JSONTextableChannel;
    /**
     * Unpin a message in this channel.
     * @param messageID The ID of the message to unpin.
     * @param reason The reason for unpinning the message.
     */
    unpinMessage(messageID: string, reason?: string): Promise<void>;
}
