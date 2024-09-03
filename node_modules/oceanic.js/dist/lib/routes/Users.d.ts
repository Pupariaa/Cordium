/** @module REST/Users */
import type Channels from "./Channels";
import type { EditSelfUserOptions } from "../types/users";
import ExtendedUser from "../structures/ExtendedUser";
import type RESTManager from "../rest/RESTManager";
import type User from "../structures/User";
/** Various methods for interacting with users. Located at {@link Client#rest | Client#rest}{@link RESTManager#users | .users}. */
export default class Users {
    private _manager;
    constructor(manager: RESTManager);
    /** Alias for {@link REST/Channels#createDM | Channels#createDM}. */
    get createDM(): typeof Channels.prototype.createDM;
    /**
     * Edit the currently authenticated user.
     * @param options The options to edit with.
     * @caching This method **does not** cache its result.
     */
    editSelf(options: EditSelfUserOptions): Promise<ExtendedUser>;
    /**
     * Get a user.
     * @param userID the ID of the user
     * @caching This method **does** cache its result.
     * @caches {@link Client#users | Client#users}
     */
    get(userID: string): Promise<User>;
    /**
     * Leave a guild.
     * @param guildID The ID of the guild to leave.
     * @caching This method **does not** cache its result.
     */
    leaveGuild(guildID: string): Promise<void>;
}
