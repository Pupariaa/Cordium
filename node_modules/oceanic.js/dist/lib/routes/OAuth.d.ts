/** @module REST/OAuth */
import type { AuthorizationInformation, ClientCredentialsTokenOptions, ClientCredentialsTokenResponse, Connection, ExchangeCodeOptions, ExchangeCodeResponse, RefreshTokenOptions, RefreshTokenResponse, RevokeTokenOptions, GetCurrentGuildsOptions, RoleConnectionMetadata, RoleConnection } from "../types/oauth";
import OAuthApplication from "../structures/OAuthApplication";
import Member from "../structures/Member";
import type RESTManager from "../rest/RESTManager";
import OAuthHelper from "../rest/OAuthHelper";
import OAuthGuild from "../structures/OAuthGuild";
import ExtendedUser from "../structures/ExtendedUser";
import type { UpdateUserApplicationRoleConnectionOptions } from "../types";
/** Various methods for interacting with oauth. Located at {@link Client#rest | Client#rest}{@link RESTManager#oauth | .oauth}. */
export default class OAuth {
    private _manager;
    constructor(manager: RESTManager);
    /**
     * Get an access token for the application owner. If the application is owned by a team, this is restricted to `identify` & `applications.commands.update`.
     * @param options The options to for the client credentials grant.
     * @caching This method **does not** cache its result.
     */
    clientCredentialsGrant(options: ClientCredentialsTokenOptions): Promise<ClientCredentialsTokenResponse>;
    /**
     * Exchange a code for an access token.
     * @param options The options for exchanging the code.
     * @caching This method **does not** cache its result.
     */
    exchangeCode(options: ExchangeCodeOptions): Promise<ExchangeCodeResponse>;
    /**
     * Get the current OAuth2 application's information.
     * @caching This method **does not** cache its result.
     */
    getApplication(): Promise<OAuthApplication>;
    /**
     * Get information about the current authorization.
     *
     * Note: OAuth only. Bots cannot use this.
     * @caching This method **does** cache part of its result.
     * @caches {@link Client#users | Client#users}
     */
    getCurrentAuthorizationInformation(): Promise<AuthorizationInformation>;
    /**
     * Get the connections of the currently authenticated user.
     *
     * Note: Requires the `connections` scope when using oauth.
     * @caching This method **does not** cache its result.
     */
    getCurrentConnections(): Promise<Array<Connection>>;
    /**
     * Get the guild member information about the currently authenticated user.
     *
     * Note: OAuth only. Requires the `guilds.members.read` scope. Bots cannot use this.
     * @param guild the ID of the guild
     * @caching This method **does not** cache its result.
     */
    getCurrentGuildMember(guild: string): Promise<Member>;
    /**
     * Get the currently authenticated user's guilds. Note these are missing several properties gateway guilds have.
     * @param options The options for getting the current user's guilds.
     * @caching This method **does not** cache its result.
     */
    getCurrentGuilds(options?: GetCurrentGuildsOptions): Promise<Array<OAuthGuild>>;
    /**
     * Get the currently authenticated user's information.
     * @caching This method **does not** cache its result.
     */
    getCurrentUser(): Promise<ExtendedUser>;
    /**
     * Get a helper instance that can be used with a specific access token.
     * @param accessToken The access token. Must be prefixed with `Bearer `.
     */
    getHelper(accessToken: string): OAuthHelper;
    /**
     * Get an application's role connection metadata records.
     * @param applicationID The ID of the application.
     * @caching This method **does not** cache its result.
     */
    getRoleConnectionsMetadata(applicationID: string): Promise<Array<RoleConnectionMetadata>>;
    /**
     * Get the authenticated user's role connection object for an application. This requires the `role_connections.write` scope.
     * @param applicationID The ID of the application.
     * @caching This method **does not** cache its result.
     */
    getUserRoleConnection(applicationID: string): Promise<RoleConnection>;
    /**
     * Refresh an existing access token.
     * @param options The options for refreshing the token.
     * @caching This method **does not** cache its result.
     */
    refreshToken(options: RefreshTokenOptions): Promise<RefreshTokenResponse>;
    /**
     * Revoke an access token.
     * @param options The options for revoking the token.
     * @caching This method **does not** cache its result.
     */
    revokeToken(options: RevokeTokenOptions): Promise<void>;
    /**
     * Update an application's role connections metadata.
     * @param applicationID The ID of the application.
     * @param metadata The metadata records.
     * @caching This method **does not** cache its result.
     */
    updateRoleConnectionsMetadata(applicationID: string, metadata: Array<RoleConnectionMetadata>): Promise<Array<RoleConnectionMetadata>>;
    /**
     * Update the authenticated user's role connection object for an application. This requires the `role_connections.write` scope.
     * @param applicationID The ID of the application.
     * @param data The metadata to update.
     * @caching This method **does not** cache its result.
     */
    updateUserRoleConnection(applicationID: string, data: UpdateUserApplicationRoleConnectionOptions): Promise<RoleConnection>;
}
