"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module PermissionOverwrite */
const Base_1 = tslib_1.__importDefault(require("./Base"));
const Permission_1 = tslib_1.__importDefault(require("./Permission"));
/** Represents a permission overwrite. */
class PermissionOverwrite extends Base_1.default {
    /** The permissions of this overwrite. */
    permission;
    /** The type of this overwrite. `0` for role, `1` for user. */
    type;
    constructor(data, client) {
        super(data.id, client);
        this.permission = new Permission_1.default(data.allow, data.deny);
        this.type = data.type;
    }
    update(data) {
        if (data.allow !== undefined || data.deny !== undefined) {
            this.permission = new Permission_1.default(data.allow ?? 0n, data.deny ?? 0n);
        }
    }
    get allow() {
        return this.permission.allow;
    }
    get deny() {
        return this.permission.deny;
    }
    /** A key-value map of permission to if it's been allowed or denied (not present if neither) */
    get json() {
        return this.permission.json;
    }
    /**
     *Check if this permissions instance has the given permissions allowed
     * @param permissions The permissions to check for.
     */
    has(...permissions) {
        return this.permission.has(...permissions);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            permission: this.permission.toJSON(),
            type: this.type
        };
    }
}
exports.default = PermissionOverwrite;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVybWlzc2lvbk92ZXJ3cml0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zdHJ1Y3R1cmVzL1Blcm1pc3Npb25PdmVyd3JpdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsa0NBQWtDO0FBQ2xDLDBEQUEwQjtBQUMxQixzRUFBc0M7QUFNdEMseUNBQXlDO0FBQ3pDLE1BQXFCLG1CQUFvQixTQUFRLGNBQUk7SUFDakQseUNBQXlDO0lBQ3pDLFVBQVUsQ0FBYTtJQUN2Qiw4REFBOEQ7SUFDOUQsSUFBSSxDQUFpQjtJQUNyQixZQUFZLElBQWtCLEVBQUUsTUFBYztRQUMxQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDMUIsQ0FBQztJQUVrQixNQUFNLENBQUMsSUFBMkI7UUFDakQsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3RELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxvQkFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7UUFDeEUsQ0FBQztJQUNMLENBQUM7SUFFRCxJQUFJLEtBQUs7UUFDTCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO0lBQ2pDLENBQUM7SUFDRCxJQUFJLElBQUk7UUFDSixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO0lBQ2hDLENBQUM7SUFFRCwrRkFBK0Y7SUFDL0YsSUFBSSxJQUFJO1FBQ0osT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztJQUNoQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsR0FBRyxDQUFDLEdBQUcsV0FBNEM7UUFDL0MsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFUSxNQUFNO1FBQ1gsT0FBTztZQUNILEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNqQixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7WUFDcEMsSUFBSSxFQUFRLElBQUksQ0FBQyxJQUFJO1NBQ3hCLENBQUM7SUFDTixDQUFDO0NBQ0o7QUE1Q0Qsc0NBNENDIn0=