"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module PublicThreadChannel */
const ThreadChannel_1 = tslib_1.__importDefault(require("./ThreadChannel"));
/** Represents a public thread channel. */
class PublicThreadChannel extends ThreadChannel_1.default {
    /** the IDs of the set of tags that have been applied to this thread. Forum channel threads only.  */
    appliedTags;
    constructor(data, client) {
        super(data, client);
        this.appliedTags = [];
    }
    update(data) {
        super.update(data);
        if (data.applied_tags !== undefined) {
            this.appliedTags = data.applied_tags;
        }
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
            appliedTags: this.appliedTags,
            threadMetadata: this.threadMetadata,
            type: this.type
        };
    }
}
exports.default = PublicThreadChannel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVibGljVGhyZWFkQ2hhbm5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zdHJ1Y3R1cmVzL1B1YmxpY1RocmVhZENoYW5uZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsa0NBQWtDO0FBQ2xDLDRFQUE0QztBQU01QywwQ0FBMEM7QUFDMUMsTUFBcUIsbUJBQW9CLFNBQVEsdUJBQWtDO0lBQy9FLHFHQUFxRztJQUNyRyxXQUFXLENBQWdCO0lBRzNCLFlBQVksSUFBNEIsRUFBRSxNQUFjO1FBQ3BELEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVrQixNQUFNLENBQUMsSUFBcUM7UUFDM0QsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQixJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDbEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQ3pDLENBQUM7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE9BQWlDO1FBQ3BELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUVRLE1BQU07UUFDWCxPQUFPO1lBQ0gsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2pCLFdBQVcsRUFBSyxJQUFJLENBQUMsV0FBVztZQUNoQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7WUFDbkMsSUFBSSxFQUFZLElBQUksQ0FBQyxJQUFJO1NBQzVCLENBQUM7SUFDTixDQUFDO0NBQ0o7QUFqQ0Qsc0NBaUNDIn0=