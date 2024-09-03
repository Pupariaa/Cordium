"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module PrivateThreadChannel */
const ThreadChannel_1 = tslib_1.__importDefault(require("./ThreadChannel"));
/** Represents a private thread channel.. */
class PrivateThreadChannel extends ThreadChannel_1.default {
    constructor(data, client) {
        super(data, client);
    }
    /**
     * Get the members of this thread.
     * @param options The options for getting the thread members.
     */
    async getThreadMembers(options) {
        return this.client.rest.channels.getThreadMembers(this.id, options);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            threadMetadata: this.threadMetadata,
            type: this.type
        };
    }
}
exports.default = PrivateThreadChannel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmF0ZVRocmVhZENoYW5uZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvc3RydWN0dXJlcy9Qcml2YXRlVGhyZWFkQ2hhbm5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMsNEVBQTRDO0FBTTVDLDRDQUE0QztBQUM1QyxNQUFxQixvQkFBcUIsU0FBUSx1QkFBbUM7SUFHakYsWUFBWSxJQUE2QixFQUFFLE1BQWM7UUFDckQsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE9BQWlDO1FBQ3BELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUVRLE1BQU07UUFDWCxPQUFPO1lBQ0gsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2pCLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYztZQUNuQyxJQUFJLEVBQVksSUFBSSxDQUFDLElBQUk7U0FDNUIsQ0FBQztJQUNOLENBQUM7Q0FDSjtBQXRCRCx1Q0FzQkMifQ==