"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const OAuthApplication_1 = tslib_1.__importDefault(require("../structures/OAuthApplication"));
const Routes = tslib_1.__importStar(require("../util/Routes"));
const PartialApplication_1 = tslib_1.__importDefault(require("../structures/PartialApplication"));
const Integration_1 = tslib_1.__importDefault(require("../structures/Integration"));
const Member_1 = tslib_1.__importDefault(require("../structures/Member"));
const OAuthGuild_1 = tslib_1.__importDefault(require("../structures/OAuthGuild"));
const ExtendedUser_1 = tslib_1.__importDefault(require("../structures/ExtendedUser"));
const Constants_1 = require("../Constants");
/** A helper to make using authenticated oauth requests without needing a new client instance. */
class OAuthHelper {
    _manager;
    _token;
    constructor(manager, token) {
        this._token = token;
        this._manager = manager;
    }
    /**
     * Construct an oauth authorization url.
     * @param options The options to construct the url with.
     */
    static constructURL(options) {
        const params = [
            `client_id=${options.clientID}`,
            `response_type=${options.responseType ?? "code"}`,
            `scope=${options.scopes.join("%20")}`
        ];
        if (options.redirectURI) {
            params.push(`redirect_uri=${options.redirectURI}`);
        }
        if (options.disableGuildSelect !== undefined) {
            params.push(`disable_guild_select=${String(options.disableGuildSelect)}`);
        }
        if (options.prompt) {
            params.push(`prompt=${options.prompt}`);
        }
        if (options.permissions) {
            params.push(`permissions=${options.permissions}`);
        }
        if (options.guildID) {
            params.push(`guild_id=${options.guildID}`);
        }
        if (options.state) {
            params.push(`state=${options.state}`);
        }
        if (options.integrationType) {
            params.push(`integration_type=${options.integrationType}`);
        }
        return `${Constants_1.BASE_URL}${Routes.OAUTH_AUTHORIZE}?${params.join("&")}`;
    }
    async addGuildMember(guildID, userID, options) {
        return this._manager.guilds.addMember(guildID, userID, { accessToken: this._token.split(" ").slice(1).join(" "), ...options });
    }
    /**
     * Get the current OAuth2 application's information.
     */
    async getApplication() {
        return this._manager.request({
            method: "GET",
            path: Routes.OAUTH_APPLICATION,
            auth: this._token
        }).then(data => new OAuthApplication_1.default(data, this._manager.client));
    }
    /**
     * Get information about the current authorization.
     */
    async getCurrentAuthorizationInformation() {
        return this._manager.request({
            method: "GET",
            path: Routes.OAUTH_INFO,
            auth: this._token
        }).then(data => ({
            application: new PartialApplication_1.default(data.application, this._manager.client),
            expires: new Date(data.expires),
            scopes: data.scopes,
            user: this._manager.client.users.update(data.user)
        }));
    }
    /**
     * Get the connections of the currently authenticated user.
     *
     * Note: Requires the `connections` scope.
     */
    async getCurrentConnections() {
        return this._manager.request({
            method: "GET",
            path: Routes.OAUTH_CONNECTIONS,
            auth: this._token
        }).then(data => data.map(connection => ({
            friendSync: connection.friend_sync,
            id: connection.id,
            integrations: connection.integrations?.map(integration => new Integration_1.default(integration, this._manager.client)),
            name: connection.name,
            revoked: connection.revoked,
            showActivity: connection.show_activity,
            twoWayLink: connection.two_way_link,
            type: connection.type,
            verified: connection.verified,
            visibility: connection.visibility
        })));
    }
    /**
     * Get the guild member information about the currently authenticated user.
     *
     * Note: Requires the `guilds.members.read` scope.
     * @param guild the ID of the guild
     */
    async getCurrentGuildMember(guild) {
        return this._manager.request({
            method: "GET",
            path: Routes.OAUTH_GUILD_MEMBER(guild),
            auth: this._token
        }).then(data => new Member_1.default(data, this._manager.client, guild));
    }
    /**
     * Get the currently authenticated user's guilds. Note these are missing several properties gateway guilds have.
     */
    async getCurrentGuilds() {
        return this._manager.request({
            method: "GET",
            path: Routes.OAUTH_GUILDS,
            auth: this._token
        }).then(data => data.map(d => new OAuthGuild_1.default(d, this._manager.client)));
    }
    /**
     * Get the currently authenticated user's information.
     *
     * Note: This does not touch the client's cache in any way.
     */
    async getCurrentUser() {
        return this._manager.request({
            method: "GET",
            path: Routes.OAUTH_CURRENT_USER,
            auth: this._token
        }).then(data => new ExtendedUser_1.default(data, this._manager.client));
    }
    /**
     * Revoke the used access token.
     * @param options The options for revoking the token.
     */
    async revokeToken(options) {
        const form = new FormData();
        form.append("client_id", options.clientID);
        form.append("client_secret", options.clientSecret);
        form.append("token", this._token);
        await this._manager.authRequest({
            method: "POST",
            path: Routes.OAUTH_TOKEN_REVOKE,
            form
        });
    }
    /**
     * Update the authenticated user's role connection object for an application. This requires the `role_connections.write` scope.
     * @param applicationID The ID of the application.
     * @param data The metadata to update.
     */
    async updateRoleConnection(applicationID, data) {
        return this._manager.request({
            method: "PUT",
            path: Routes.OAUTH_ROLE_CONNECTION(applicationID),
            json: {
                metadata: data.metadata,
                platform_name: data.platformName,
                platform_username: data.platformUsername
            },
            auth: this._token
        }).then(d => ({
            metadata: Object.entries(d.metadata).map(([key, value]) => ({
                [key]: {
                    description: value.description,
                    descriptionLocalizations: value.description_localizations,
                    key: value.key,
                    name: value.name,
                    nameLocalizations: value.name_localizations,
                    type: value.type
                }
            })).reduce((a, b) => ({ ...a, ...b })),
            platformName: d.platform_name,
            platformUsername: d.platform_username
        }));
    }
}
exports.default = OAuthHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT0F1dGhIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvcmVzdC9PQXV0aEhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSw4RkFBOEQ7QUFVOUQsK0RBQXlDO0FBQ3pDLGtHQUFrRTtBQUNsRSxvRkFBb0Q7QUFDcEQsMEVBQTBDO0FBQzFDLGtGQUFrRDtBQUNsRCxzRkFBc0Q7QUFTdEQsNENBQXdDO0FBRXhDLGlHQUFpRztBQUNqRyxNQUFxQixXQUFXO0lBQ3BCLFFBQVEsQ0FBYztJQUN0QixNQUFNLENBQVM7SUFDdkIsWUFBWSxPQUFvQixFQUFFLEtBQWE7UUFDM0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7SUFDNUIsQ0FBQztJQUVEOzs7T0FHRztJQUNILE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBd0I7UUFDeEMsTUFBTSxNQUFNLEdBQWtCO1lBQzFCLGFBQWEsT0FBTyxDQUFDLFFBQVEsRUFBRTtZQUMvQixpQkFBaUIsT0FBTyxDQUFDLFlBQVksSUFBSSxNQUFNLEVBQUU7WUFDakQsU0FBUyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtTQUN4QyxDQUFDO1FBQ0YsSUFBSSxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdEIsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUNELElBQUksT0FBTyxDQUFDLGtCQUFrQixLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLE1BQU0sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUNELElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2pCLE1BQU0s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