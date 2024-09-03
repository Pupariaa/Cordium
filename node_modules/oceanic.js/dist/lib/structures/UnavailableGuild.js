"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module UnavailableGuild */
const Base_1 = tslib_1.__importDefault(require("./Base"));
/** Represents a guild that is unavailable. */
class UnavailableGuild extends Base_1.default {
    unavailable;
    constructor(data, client) {
        super(data.id, client);
        this.unavailable = data.unavailable;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            unavailable: this.unavailable
        };
    }
}
exports.default = UnavailableGuild;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5hdmFpbGFibGVHdWlsZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zdHJ1Y3R1cmVzL1VuYXZhaWxhYmxlR3VpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0JBQStCO0FBQy9CLDBEQUEwQjtBQUsxQiw4Q0FBOEM7QUFDOUMsTUFBcUIsZ0JBQWlCLFNBQVEsY0FBSTtJQUM5QyxXQUFXLENBQU87SUFDbEIsWUFBWSxJQUF5QixFQUFFLE1BQWM7UUFDakQsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQ3hDLENBQUM7SUFFUSxNQUFNO1FBQ1gsT0FBTztZQUNILEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNqQixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7U0FDaEMsQ0FBQztJQUNOLENBQUM7Q0FDSjtBQWJELG1DQWFDIn0=