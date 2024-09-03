/** @module RESTManager */
import RequestHandler from "./RequestHandler";
import type Client from "../Client";
import Channels from "../routes/Channels";
import Guilds from "../routes/Guilds";
import Users from "../routes/Users";
import OAuth from "../routes/OAuth";
import Webhooks from "../routes/Webhooks";
import type { RESTOptions } from "../types/client";
import type { RequestOptions } from "../types/request-handler";
import Applications from "../routes/Applications";
import Interactions from "../routes/Interactions";
import type { GetBotGatewayResponse, GetGatewayResponse } from "../types/gateway";
import Miscellaneous from "../routes/Miscellaneous";
/** A manager for all rest actions. */
export default class RESTManager {
    private _client;
    applications: Applications;
    channels: Channels;
    guilds: Guilds;
    handler: RequestHandler;
    interactions: Interactions;
    misc: Miscellaneous;
    oauth: OAuth;
    users: Users;
    webhooks: Webhooks;
    constructor(client: Client, options?: RESTOptions);
    get client(): Client;
    get options(): RESTOptions;
    /** Alias for {@link RequestHandler#authRequest | RequestHandler#authRequest} */
    authRequest<T = unknown>(options: Omit<RequestOptions, "auth">): Promise<T>;
    /**
     * Get the gateway information related to your bot client.
     */
    getBotGateway(): Promise<GetBotGatewayResponse>;
    /**
     * Get the gateway information.
     */
    getGateway(): Promise<GetGatewayResponse>;
    /** Alias for {@link RequestHandler#request | RequestHandler#request} */
    request<T = unknown>(options: RequestOptions): Promise<T>;
}
