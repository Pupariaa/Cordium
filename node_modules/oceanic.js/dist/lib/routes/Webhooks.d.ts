/** @module REST/Webhooks */
import type { CreateWebhookOptions, DeleteWebhookMessageOptions, EditWebhookMessageOptions, EditWebhookOptions, EditWebhookTokenOptions, ExecuteWebhookOptions, ExecuteWebhookWaitOptions } from "../types/webhooks";
import type { AnyTextableChannel } from "../types/channels";
import Webhook from "../structures/Webhook";
import Message from "../structures/Message";
import type RESTManager from "../rest/RESTManager";
import type { Uncached } from "../types/shared";
/** Various methods for interacting with webhooks. Located at {@link Client#rest | Client#rest}{@link RESTManager#webhooks | .webhooks}. */
export default class Webhooks {
    private _manager;
    constructor(manager: RESTManager);
    /**
     * Create a channel webhook.
     * @param channelID The ID of the channel to create the webhook in.
     * @param options The options to create the webhook with.
     * @caching This method **does not** cache its result.
     */
    create(channelID: string, options: CreateWebhookOptions): Promise<Webhook>;
    /**
     * Delete a webhook.
     * @param webhookID The ID of the webhook.
     * @param reason The reason for deleting the webhook.
     * @caching This method **does not** cache its result.
     */
    delete(webhookID: string, reason?: string): Promise<void>;
    /**
     * Delete a webhook message.
     * @param webhookID The ID of the webhook.
     * @param token The token of the webhook.
     * @param messageID The ID of the message.
     * @param options The options for deleting the message.
     * @caching This method **does not** cache its result.
     */
    deleteMessage(webhookID: string, token: string, messageID: string, options?: DeleteWebhookMessageOptions): Promise<void>;
    /**
     * Delete a webhook via its token.
     * @param webhookID The ID of the webhook.
     * @param token The token of the webhook.
     * @caching This method **does not** cache its result.
     */
    deleteToken(webhookID: string, token: string): Promise<void>;
    /**
     * Edit a webhook.
     * @param webhookID The ID of the webhook.
     * @param options The options for editing the webhook.
     * @caching This method **does not** cache its result.
     */
    edit(webhookID: string, options: EditWebhookOptions): Promise<Webhook>;
    /**
     * Edit a webhook message.
     * @param webhookID The ID of the webhook.
     * @param token The token of the webhook.
     * @param messageID The ID of the message to edit.
     * @param options The options for editing the message.
     * @caching This method **does not** cache its result.
     */
    editMessage<T extends AnyTextableChannel | Uncached>(webhookID: string, token: string, messageID: string, options: EditWebhookMessageOptions): Promise<Message<T>>;
    /**
     * Edit a webhook via its token.
     * @param webhookID The ID of the webhook.
     * @param options The options for editing the webhook.
     * @caching This method **does not** cache its result.
     */
    editToken(webhookID: string, token: string, options: EditWebhookTokenOptions): Promise<Webhook>;
    /**
     * Execute a webhook.
     * @param webhookID The ID of the webhook.
     * @param token The token of the webhook.
     * @param options The options for executing the webhook.
     * @caching This method **does not** cache its result.
     */
    execute<T extends AnyTextableChannel | Uncached>(webhookID: string, token: string, options: ExecuteWebhookWaitOptions): Promise<Message<T>>;
    execute(webhookID: string, token: string, options: ExecuteWebhookOptions): Promise<void>;
    /**
     * Execute a GitHub compatible webhook.
     * @param webhookID The ID of the webhook.
     * @param token The token of the webhook.
     * @param options The options to send. See GitHub's documentation for more information.
     * @caching This method **does not** cache its result.
     */
    executeGithub(webhookID: string, token: string, options: Record<string, unknown> & {
        wait: false;
    }): Promise<void>;
    executeGithub<T extends AnyTextableChannel | Uncached>(webhookID: string, token: string, options: Record<string, unknown> & {
        wait?: true;
    }): Promise<Message<T>>;
    /**
     * Execute a slack compatible webhook.
     * @param webhookID The ID of the webhook.
     * @param token The token of the webhook.
     * @param options The options to send. See [Slack's Documentation](https://api.slack.com/incoming-webhooks) for more information.
     * @caching This method **does not** cache its result.
     */
    executeSlack(webhookID: string, token: string, options: Record<string, unknown> & {
        wait: false;
    }): Promise<void>;
    executeSlack<T extends AnyTextableChannel | Uncached>(webhookID: string, token: string, options: Record<string, unknown> & {
        wait?: true;
    }): Promise<Message<T>>;
    /**
     * Get a webhook by ID (and optionally token).
     * @param webhookID The ID of the webhook.
     * @param token The token of the webhook.
     * @caching This method **does not** cache its result.
     */
    get(webhookID: string, token?: string): Promise<Webhook>;
    /**
     * Get the webhooks in the specified channel.
     * @param channelID The ID of the channel to get the webhooks of.
     * @caching This method **does not** cache its result.
     */
    getForChannel(channelID: string): Promise<Array<Webhook>>;
    /**
     * Get the webhooks in the specified guild.
     * @param guildID The ID of the guild to get the webhooks of.
     * @caching This method **does not** cache its result.
     */
    getForGuild(guildID: string): Promise<Array<Webhook>>;
    /**
     * Get a webhook message.
     * @param webhookID The ID of the webhook.
     * @param token The token of the webhook.
     * @param messageID The ID of the message.
     * @param threadID The ID of the thread the message is in.
     * @caching This method **does not** cache its result.
     */
    getMessage<T extends AnyTextableChannel | Uncached>(webhookID: string, token: string, messageID: string, threadID?: string): Promise<Message<T>>;
}
