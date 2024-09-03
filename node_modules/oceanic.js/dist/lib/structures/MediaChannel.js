"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module MediaChannel */
const ThreadOnlyChannel_1 = tslib_1.__importDefault(require("./ThreadOnlyChannel"));
/** Represents a media channel. */
class MediaChannel extends ThreadOnlyChannel_1.default {
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
exports.default = MediaChannel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWVkaWFDaGFubmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3N0cnVjdHVyZXMvTWVkaWFDaGFubmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJCQUEyQjtBQUMzQixvRkFBb0Q7QUFLcEQsa0NBQWtDO0FBQ2xDLE1BQXFCLFlBQWEsU0FBUSwyQkFBaUI7SUFFdkQsWUFBWSxJQUFxQixFQUFFLE1BQWM7UUFDN0MsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRVEsTUFBTTtRQUNYLE9BQU87WUFDSCxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDakIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1NBQ2xCLENBQUM7SUFDTixDQUFDO0NBQ0o7QUFaRCwrQkFZQyJ9