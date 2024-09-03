"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module ForumChannel */
const ThreadOnlyChannel_1 = tslib_1.__importDefault(require("./ThreadOnlyChannel"));
/** Represents a thread forum channel. */
class ForumChannel extends ThreadOnlyChannel_1.default {
    constructor(data, client) {
        super(data, client);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            type: this.type
        };
    }
}
exports.default = ForumChannel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9ydW1DaGFubmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3N0cnVjdHVyZXMvRm9ydW1DaGFubmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJCQUEyQjtBQUMzQixvRkFBb0Q7QUFLcEQseUNBQXlDO0FBQ3pDLE1BQXFCLFlBQWEsU0FBUSwyQkFBaUI7SUFFdkQsWUFBWSxJQUFxQixFQUFFLE1BQWM7UUFDN0MsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRVEsTUFBTTtRQUNYLE9BQU87WUFDSCxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDakIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1NBQ2xCLENBQUM7SUFDTixDQUFDO0NBQ0o7QUFaRCwrQkFZQyJ9