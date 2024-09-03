"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module OAuthGuild */
const Base_1 = tslib_1.__importDefault(require("./Base"));
const Permission_1 = tslib_1.__importDefault(require("./Permission"));
const Routes = tslib_1.__importStar(require("../util/Routes"));
/** Represents a guild retrieved via oauth. */
class OAuthGuild extends Base_1.default {
    _cachedCompleteGuild;
    /** The approximate number of members in this guild (if retrieved with counts). */
    approximateMemberCount;
    /** The approximate number of non-offline members in this guild (if retrieved with counts). */
    approximatePresenceCount;
    /** The hash of this guild's banner. */
    banner;
    /** The [features](https://discord.com/developers/docs/resources/guild#guild-object-guild-features) this guild has. */
    features;
    /** The icon hash of this guild. */
    icon;
    /** The name of this guild. */
    name;
    /** If the user is the owner of this guild. */
    owner;
    /** The permissions of the user in this guild. */
    permissions;
    constructor(data, client) {
        super(data.id, client);
        this.approximateMemberCount = data.approximate_member_count;
        this.approximatePresenceCount = data.approximate_presence_count;
        this.banner = data.banner;
        this.features = data.features;
        this.name = data.name;
        this.icon = data.icon;
        this.owner = data.owner;
        this.permissions = new Permission_1.default(data.permissions);
    }
    /** The complete guild this OAuthGuild represents, if cached. */
    get completeGuild() {
        return this._cachedCompleteGuild ??= this.client.guilds.get(this.id);
    }
    /**
     * The url of this guild's banner.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    bannerURL(format, size) {
        return this.banner === null ? null : this.client.util.formatImage(Routes.BANNER(this.id, this.banner), format, size);
    }
    /**
     * The url of this guild's icon.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    iconURL(format, size) {
        return this.icon === null ? null : this.client.util.formatImage(Routes.GUILD_ICON(this.id, this.icon), format, size);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            approximateMemberCount: this.approximateMemberCount,
            approximatePresenceCount: this.approximatePresenceCount,
            banner: this.banner,
            features: this.features,
            icon: this.icon,
            name: this.name,
            owner: this.owner,
            permissions: this.permissions.toJSON()
        };
    }
}
exports.default = OAuthGuild;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT0F1dGhHdWlsZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zdHJ1Y3R1cmVzL09BdXRoR3VpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUJBQXlCO0FBQ3pCLDBEQUEwQjtBQUMxQixzRUFBc0M7QUFLdEMsK0RBQXlDO0FBRXpDLDhDQUE4QztBQUM5QyxNQUFxQixVQUFXLFNBQVEsY0FBSTtJQUNoQyxvQkFBb0IsQ0FBUztJQUNyQyxrRkFBa0Y7SUFDbEYsc0JBQXNCLENBQVU7SUFDaEMsOEZBQThGO0lBQzlGLHdCQUF3QixDQUFVO0lBQ2xDLHVDQUF1QztJQUN2QyxNQUFNLENBQWdCO0lBQ3RCLHNIQUFzSDtJQUN0SCxRQUFRLENBQXNCO0lBQzlCLG1DQUFtQztJQUNuQyxJQUFJLENBQWdCO0lBQ3BCLDhCQUE4QjtJQUM5QixJQUFJLENBQVM7SUFDYiw4Q0FBOEM7SUFDOUMsS0FBSyxDQUFVO0lBQ2YsaURBQWlEO0lBQ2pELFdBQVcsQ0FBYTtJQUN4QixZQUFZLElBQW1CLEVBQUUsTUFBYztRQUMzQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDO1FBQzVELElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUM7UUFDaEUsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQzFCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUM5QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN4QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksb0JBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVELGdFQUFnRTtJQUNoRSxJQUFJLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxvQkFBb0IsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBUyxDQUFDLE1BQW9CLEVBQUUsSUFBYTtRQUN6QyxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN6SCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE9BQU8sQ0FBQyxNQUFvQixFQUFFLElBQWE7UUFDdkMsT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDekgsQ0FBQztJQUVRLE1BQU07UUFDWCxPQUFPO1lBQ0gsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2pCLHNCQUFzQixFQUFJLElBQUksQ0FBQyxzQkFBc0I7WUFDckQsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLHdCQUF3QjtZQUN2RCxNQUFNLEVBQW9CLElBQUksQ0FBQyxNQUFNO1lBQ3JDLFFBQVEsRUFBa0IsSUFBSSxDQUFDLFFBQVE7WUFDdkMsSUFBSSxFQUFzQixJQUFJLENBQUMsSUFBSTtZQUNuQyxJQUFJLEVBQXNCLElBQUksQ0FBQyxJQUFJO1lBQ25DLEtBQUssRUFBcUIsSUFBSSxDQUFDLEtBQUs7WUFDcEMsV0FBVyxFQUFlLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFO1NBQ3RELENBQUM7SUFDTixDQUFDO0NBQ0o7QUFsRUQsNkJBa0VDIn0=