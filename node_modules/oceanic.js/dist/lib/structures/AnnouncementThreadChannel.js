"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module AnnouncementThreadChannel */
const ThreadChannel_1 = tslib_1.__importDefault(require("./ThreadChannel"));
/** Represents a public thread channel in an announcement channel. */
class AnnouncementThreadChannel extends ThreadChannel_1.default {
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
exports.default = AnnouncementThreadChannel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5ub3VuY2VtZW50VGhyZWFkQ2hhbm5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zdHJ1Y3R1cmVzL0Fubm91bmNlbWVudFRocmVhZENoYW5uZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0NBQXdDO0FBQ3hDLDRFQUE0QztBQU01QyxxRUFBcUU7QUFDckUsTUFBcUIseUJBQTBCLFNBQVEsdUJBQXdDO0lBRzNGLFlBQVksSUFBa0MsRUFBRSxNQUFjO1FBQzFELEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFpQztRQUNwRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFFUSxNQUFNO1FBQ1gsT0FBTztZQUNILEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNqQixjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7WUFDbkMsSUFBSSxFQUFZLElBQUksQ0FBQyxJQUFJO1NBQzVCLENBQUM7SUFDTixDQUFDO0NBQ0o7QUF0QkQsNENBc0JDIn0=