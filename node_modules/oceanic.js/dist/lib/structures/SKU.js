"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Base_1 = tslib_1.__importDefault(require("./Base"));
class SKU extends Base_1.default {
    accessType; // undocumented
    applicationID;
    dependentSKUID;
    features; // undocumented
    /** The flags for this SKU. See {@link Constants~SKUFlags | SKUFlags}. */
    flags;
    manifestLabels; // undocumented
    name;
    releaseDate; // undocumented
    showAgeGate;
    slug;
    type;
    constructor(data, client) {
        super(data.id, client);
        this.accessType = data.access_type;
        this.applicationID = data.application_id;
        this.dependentSKUID = data.dependent_sku_id;
        this.features = data.features;
        this.flags = data.flags;
        this.manifestLabels = data.manifest_labels;
        this.name = data.name;
        this.releaseDate = data.release_date;
        this.showAgeGate = data.show_age_gate;
        this.slug = data.slug;
        this.type = data.type;
    }
    /**
     * Create a test entitlement for this SKU.
     * @param ownerType The type of the owner to create the entitlement for.
     * @param ownerID The ID of the owner to create the entitlement for.
     */
    async createTestEntitlement(ownerType, ownerID) {
        return this.client.rest.applications.createTestEntitlement(this.applicationID, {
            ownerID,
            ownerType,
            skuID: this.id
        });
    }
    /**
     * Get the entitlements for this SKU.
     * @param options The options for getting the entitlements.
     */
    async getEntitlements(options) {
        return this.client.rest.applications.getEntitlements(this.applicationID, { skuIDs: [this.id], ...options });
    }
}
exports.default = SKU;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU0tVLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3N0cnVjdHVyZXMvU0tVLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBEQUEwQjtBQU8xQixNQUFxQixHQUFJLFNBQVEsY0FBSTtJQUNqQyxVQUFVLENBQWlCLENBQUMsZUFBZTtJQUMzQyxhQUFhLENBQVM7SUFDdEIsY0FBYyxDQUFnQjtJQUM5QixRQUFRLENBQUssQ0FBQyxlQUFlO0lBQzdCLHlFQUF5RTtJQUN6RSxLQUFLLENBQVM7SUFDZCxjQUFjLENBQU8sQ0FBQyxlQUFlO0lBQ3JDLElBQUksQ0FBUztJQUNiLFdBQVcsQ0FBTyxDQUFDLGVBQWU7SUFDbEMsV0FBVyxDQUFVO0lBQ3JCLElBQUksQ0FBUztJQUNiLElBQUksQ0FBVztJQUNmLFlBQVksSUFBWSxFQUFFLE1BQWM7UUFDcEMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ25DLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUN6QyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUM1QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDOUIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUMzQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUN0QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLHFCQUFxQixDQUFDLFNBQWdDLEVBQUUsT0FBZTtRQUN6RSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQzNFLE9BQU87WUFDUCxTQUFTO1lBQ1QsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFO1NBQ2pCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsZUFBZSxDQUFDLE9BQW1EO1FBQ3JFLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUNoSCxDQUFDO0NBQ0o7QUFoREQsc0JBZ0RDIn0=