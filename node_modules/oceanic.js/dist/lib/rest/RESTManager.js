"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module RESTManager */
const RequestHandler_1 = tslib_1.__importDefault(require("./RequestHandler"));
const Channels_1 = tslib_1.__importDefault(require("../routes/Channels"));
const Guilds_1 = tslib_1.__importDefault(require("../routes/Guilds"));
const Users_1 = tslib_1.__importDefault(require("../routes/Users"));
const OAuth_1 = tslib_1.__importDefault(require("../routes/OAuth"));
const Webhooks_1 = tslib_1.__importDefault(require("../routes/Webhooks"));
const Applications_1 = tslib_1.__importDefault(require("../routes/Applications"));
const Interactions_1 = tslib_1.__importDefault(require("../routes/Interactions"));
const Routes = tslib_1.__importStar(require("../util/Routes"));
const Miscellaneous_1 = tslib_1.__importDefault(require("../routes/Miscellaneous"));
/** A manager for all rest actions. */
class RESTManager {
    _client;
    applications;
    channels;
    guilds;
    handler;
    interactions;
    misc;
    oauth;
    users;
    webhooks;
    constructor(client, options) {
        this.applications = new Applications_1.default(this);
        this.channels = new Channels_1.default(this);
        this._client = client;
        this.guilds = new Guilds_1.default(this);
        this.handler = new RequestHandler_1.default(this, options);
        this.interactions = new Interactions_1.default(this);
        this.misc = new Miscellaneous_1.default(this);
        this.oauth = new OAuth_1.default(this);
        this.users = new Users_1.default(this);
        this.webhooks = new Webhooks_1.default(this);
    }
    get client() {
        return this._client;
    }
    get options() {
        return this.handler.options;
    }
    /** Alias for {@link RequestHandler#authRequest | RequestHandler#authRequest} */
    async authRequest(options) {
        return this.handler.authRequest(options);
    }
    /**
     * Get the gateway information related to your bot client.
     */
    async getBotGateway() {
        return this.authRequest({
            method: "GET",
            path: Routes.GATEWAY_BOT
        }).then(data => ({
            url: data.url,
            shards: data.shards,
            sessionStartLimit: {
                total: data.session_start_limit.total,
                remaining: data.session_start_limit.remaining,
                resetAfter: data.session_start_limit.reset_after,
                maxConcurrency: data.session_start_limit.max_concurrency
            }
        }));
    }
    /**
     * Get the gateway information.
     */
    async getGateway() {
        return this.request({
            method: "GET",
            path: Routes.GATEWAY
        });
    }
    /** Alias for {@link RequestHandler#request | RequestHandler#request} */
    async request(options) {
        return this.handler.request(options);
    }
}
exports.default = RESTManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUkVTVE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvcmVzdC9SRVNUTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQkFBMEI7QUFDMUIsOEVBQThDO0FBRTlDLDBFQUEwQztBQUMxQyxzRUFBc0M7QUFDdEMsb0VBQW9DO0FBQ3BDLG9FQUFvQztBQUNwQywwRUFBMEM7QUFHMUMsa0ZBQWtEO0FBQ2xELGtGQUFrRDtBQUNsRCwrREFBeUM7QUFFekMsb0ZBQW9EO0FBRXBELHNDQUFzQztBQUN0QyxNQUFxQixXQUFXO0lBQ3BCLE9BQU8sQ0FBUztJQUN4QixZQUFZLENBQWU7SUFDM0IsUUFBUSxDQUFXO0lBQ25CLE1BQU0sQ0FBUztJQUNmLE9BQU8sQ0FBaUI7SUFDeEIsWUFBWSxDQUFlO0lBQzNCLElBQUksQ0FBZ0I7SUFDcEIsS0FBSyxDQUFRO0lBQ2IsS0FBSyxDQUFRO0lBQ2IsUUFBUSxDQUFXO0lBQ25CLFlBQVksTUFBYyxFQUFFLE9BQXFCO1FBQzdDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxrQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxnQkFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSx3QkFBYyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksdUJBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksZUFBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxlQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGtCQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELElBQUksTUFBTTtRQUNOLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBQ0QsSUFBSSxPQUFPO1FBQ1AsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztJQUNoQyxDQUFDO0lBRUQsZ0ZBQWdGO0lBQ2hGLEtBQUssQ0FBQyxXQUFXLENBQWMsT0FBcUM7UUFDaEUsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBSSxPQUFPLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsYUFBYTtRQUNmLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBMkI7WUFDOUMsTUFBTSxFQUFFLEtBQUs7WUFDYixJQUFJLEVBQUksTUFBTSxDQUFDLFdBQVc7U0FDN0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDYixHQUFHLEVBQWdCLElBQUksQ0FBQyxHQUFHO1lBQzNCLE1BQU0sRUFBYSxJQUFJLENBQUMsTUFBTTtZQUM5QixpQkFBaUIsRUFBRTtnQkFDZixLQUFLLEVBQVcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUs7Z0JBQzlDLFNBQVMsRUFBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUztnQkFDbEQsVUFBVSxFQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXO2dCQUNwRCxjQUFjLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWU7YUFDM0Q7U0FDSixDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxVQUFVO1FBQ1osT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFxQjtZQUNwQyxNQUFNLEVBQUUsS0FBSztZQUNiLElBQUksRUFBSSxNQUFNLENBQUMsT0FBTztTQUN6QixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsd0VBQXdFO0lBQ3hFLEtBQUssQ0FBQyxPQUFPLENBQWMsT0FBdUI7UUFDOUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBSSxPQUFPLENBQUMsQ0FBQztJQUM1QyxDQUFDO0NBQ0o7QUFyRUQsOEJBcUVDIn0=