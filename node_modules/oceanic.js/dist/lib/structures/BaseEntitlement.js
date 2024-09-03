"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Base_1 = tslib_1.__importDefault(require("./Base"));
/** Represents a base entitlement. See {@link TestEntitlement | TestEntitlement} and {@link Entitlement | Entitlement}. */
class BaseEntitlement extends Base_1.default {
    applicationID;
    consumed;
    deleted;
    giftCodeFlags;
    guildID;
    promotionID;
    skuID;
    type;
    userID;
    constructor(data, client) {
        super(data.id, client);
        this.applicationID = data.application_id;
        this.consumed = data.consumed;
        this.deleted = data.deleted;
        this.giftCodeFlags = data.gift_code_flags;
        this.guildID = data.guild_id;
        this.promotionID = data.promotion_id;
        this.skuID = data.sku_id;
        this.type = data.type;
        this.userID = data.user_id;
    }
    /** Mark this entitlement as consumed. */
    async consume() {
        return this.client.rest.applications.consumeEntitlement(this.applicationID, this.id);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            applicationID: this.applicationID,
            consumed: this.consumed,
            deleted: this.deleted,
            giftCodeFlags: this.giftCodeFlags,
            guildID: this.guildID,
            promotionID: this.promotionID,
            skuID: this.skuID,
            type: this.type,
            userID: this.userID
        };
    }
}
exports.default = BaseEntitlement;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZUVudGl0bGVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3N0cnVjdHVyZXMvQmFzZUVudGl0bGVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBEQUEwQjtBQU0xQiwwSEFBMEg7QUFDMUgsTUFBcUIsZUFBZ0IsU0FBUSxjQUFJO0lBQzdDLGFBQWEsQ0FBUztJQUN0QixRQUFRLENBQVU7SUFDbEIsT0FBTyxDQUFVO0lBQ2pCLGFBQWEsQ0FBUztJQUN0QixPQUFPLENBQWdCO0lBQ3ZCLFdBQVcsQ0FBZ0I7SUFDM0IsS0FBSyxDQUFTO0lBQ2QsSUFBSSxDQUFtQjtJQUN2QixNQUFNLENBQWdCO0lBQ3RCLFlBQVksSUFBd0IsRUFBRSxNQUFjO1FBQ2hELEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUN6QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDOUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzVCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUMxQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDN0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUN6QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQy9CLENBQUM7SUFFRCx5Q0FBeUM7SUFDekMsS0FBSyxDQUFDLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBRVEsTUFBTTtRQUNYLE9BQU87WUFDSCxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDakIsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO1lBQ2pDLFFBQVEsRUFBTyxJQUFJLENBQUMsUUFBUTtZQUM1QixPQUFPLEVBQVEsSUFBSSxDQUFDLE9BQU87WUFDM0IsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO1lBQ2pDLE9BQU8sRUFBUSxJQUFJLENBQUMsT0FBTztZQUMzQixXQUFXLEVBQUksSUFBSSxDQUFDLFdBQVc7WUFDL0IsS0FBSyxFQUFVLElBQUksQ0FBQyxLQUFLO1lBQ3pCLElBQUksRUFBVyxJQUFJLENBQUMsSUFBSTtZQUN4QixNQUFNLEVBQVMsSUFBSSxDQUFDLE1BQU07U0FDN0IsQ0FBQztJQUNOLENBQUM7Q0FDSjtBQTFDRCxrQ0EwQ0MifQ==