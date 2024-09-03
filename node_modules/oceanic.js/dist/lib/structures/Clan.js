"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module Clan */
const Routes = tslib_1.__importStar(require("../util/Routes"));
/** Represents an invite. */
class Clan {
    /** The badge hash of this clan. */
    badge;
    client;
    identityEnabled;
    identityGuildID;
    /** The tag of this clan, shown beside messages. */
    tag;
    constructor(data, client) {
        Object.defineProperty(this, "client", {
            value: client,
            enumerable: false,
            writable: false,
            configurable: false
        });
        this.badge = data.badge;
        this.identityEnabled = data.identity_enabled;
        this.identityGuildID = data.identity_guild_id;
        this.tag = data.tag;
        this.update(data);
    }
    update(data) {
        if (data.badge !== undefined) {
            this.badge = data.badge;
        }
        if (data.identity_enabled !== undefined) {
            this.identityEnabled = data.identity_enabled;
        }
        if (data.identity_guild_id !== undefined) {
            this.identityGuildID = data.identity_guild_id;
        }
        if (data.tag !== undefined) {
            this.tag = data.tag;
        }
    }
    /**
     * The url of this guild's icon.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    badgeURL(format, size) {
        return this.client.util.formatImage(Routes.CLAN_ICON(this.identityGuildID, this.badge), format, size);
    }
    toJSON() {
        return {
            badge: this.badge,
            identityEnabled: this.identityEnabled,
            identityGuildID: this.identityGuildID,
            tag: this.tag
        };
    }
}
exports.default = Clan;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xhbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zdHJ1Y3R1cmVzL0NsYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUJBQW1CO0FBQ25CLCtEQUF5QztBQU16Qyw0QkFBNEI7QUFDNUIsTUFBcUIsSUFBSTtJQUNyQixtQ0FBbUM7SUFDbkMsS0FBSyxDQUFTO0lBQ2QsTUFBTSxDQUFVO0lBQ2hCLGVBQWUsQ0FBVTtJQUN6QixlQUFlLENBQVM7SUFDeEIsbURBQW1EO0lBQ25ELEdBQUcsQ0FBUztJQUNaLFlBQVksSUFBYSxFQUFFLE1BQWM7UUFDckMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO1lBQ2xDLEtBQUssRUFBUyxNQUFNO1lBQ3BCLFVBQVUsRUFBSSxLQUFLO1lBQ25CLFFBQVEsRUFBTSxLQUFLO1lBQ25CLFlBQVksRUFBRSxLQUFLO1NBQ3RCLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN4QixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUM3QyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztRQUM5QyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDcEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0QixDQUFDO0lBRVMsTUFBTSxDQUFDLElBQXNCO1FBQ25DLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDNUIsQ0FBQztRQUVELElBQUksSUFBSSxDQUFDLGdCQUFnQixLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBQ2pELENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztRQUNsRCxDQUFDO1FBRUQsSUFBSSxJQUFJLENBQUMsR0FBRyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUN4QixDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxRQUFRLENBQUMsTUFBb0IsRUFBRSxJQUFhO1FBQ3hDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzFHLENBQUM7SUFFRCxNQUFNO1FBQ0YsT0FBTztZQUNILEtBQUssRUFBWSxJQUFJLENBQUMsS0FBSztZQUMzQixlQUFlLEVBQUUsSUFBSSxDQUFDLGVBQWU7WUFDckMsZUFBZSxFQUFFLElBQUksQ0FBQyxlQUFlO1lBQ3JDLEdBQUcsRUFBYyxJQUFJLENBQUMsR0FBRztTQUM1QixDQUFDO0lBQ04sQ0FBQztDQUNKO0FBekRELHVCQXlEQyJ9