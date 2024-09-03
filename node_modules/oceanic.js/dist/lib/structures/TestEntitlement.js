"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const BaseEntitlement_1 = tslib_1.__importDefault(require("./BaseEntitlement"));
/** Represents a test entitlement. */
class TestEntitlement extends BaseEntitlement_1.default {
    constructor(data, client) {
        super(data, client);
    }
    /** Delete this entitlement. */
    async delete() {
        return this.client.rest.applications.deleteTestEntitlement(this.applicationID, this.id);
    }
    toJSON() {
        return {
            ...super.toJSON()
        };
    }
}
exports.default = TestEntitlement;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdEVudGl0bGVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3N0cnVjdHVyZXMvVGVzdEVudGl0bGVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGdGQUFnRDtBQUloRCxxQ0FBcUM7QUFDckMsTUFBcUIsZUFBZ0IsU0FBUSx5QkFBZTtJQUN4RCxZQUFZLElBQXdCLEVBQUUsTUFBYztRQUNoRCxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRCwrQkFBK0I7SUFDL0IsS0FBSyxDQUFDLE1BQU07UUFDUixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM1RixDQUFDO0lBRVEsTUFBTTtRQUNYLE9BQU87WUFDSCxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUU7U0FDcEIsQ0FBQztJQUNOLENBQUM7Q0FDSjtBQWZELGtDQWVDIn0=