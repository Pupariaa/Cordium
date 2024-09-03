"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module DiscordHTTPError */
const DiscordRESTError_1 = tslib_1.__importDefault(require("./DiscordRESTError"));
/** An HTTP error received from Discord. */
class DiscordHTTPError extends Error {
    method;
    name = "DiscordHTTPError";
    resBody;
    response;
    constructor(res, resBody, method, stack) {
        // eslint-disable-next-line unicorn/custom-error-definition
        super();
        Object.defineProperties(this, {
            method: {
                value: method,
                enumerable: false
            },
            response: {
                value: res,
                enumerable: false
            },
            resBody: {
                value: resBody,
                enumerable: false
            }
        });
        let message = `${res.status} ${res.statusText} on ${this.method} ${this.path}`;
        const errors = DiscordRESTError_1.default.flattenErrors(resBody);
        if (errors.length !== 0) {
            message += `\n  ${errors.join("\n  ")}`;
        }
        this.message = message;
        if (stack) {
            this.stack = this.name + ": " + this.message + "\n" + stack;
        }
        else {
            Error.captureStackTrace(this, DiscordHTTPError);
        }
    }
    get headers() {
        return this.response.headers;
    }
    get path() {
        return new URL(this.response.url).pathname;
    }
    get status() {
        return this.response.status;
    }
    get statusText() {
        return this.response.statusText;
    }
    toJSON() {
        return {
            message: this.message,
            method: this.method,
            name: this.name,
            resBody: this.resBody,
            stack: this.stack ?? ""
        };
    }
}
exports.default = DiscordHTTPError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzY29yZEhUVFBFcnJvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9yZXN0L0Rpc2NvcmRIVFRQRXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0JBQStCO0FBQy9CLGtGQUFrRDtBQUlsRCwyQ0FBMkM7QUFDM0MsTUFBcUIsZ0JBQWlCLFNBQVEsS0FBSztJQUMvQyxNQUFNLENBQWM7SUFDWCxJQUFJLEdBQUcsa0JBQWtCLENBQUM7SUFDbkMsT0FBTyxDQUFrQztJQUN6QyxRQUFRLENBQVk7SUFDcEIsWUFBWSxHQUFhLEVBQUUsT0FBZ0IsRUFBRSxNQUFrQixFQUFFLEtBQWM7UUFDM0UsMkRBQTJEO1FBQzNELEtBQUssRUFBRSxDQUFDO1FBQ1IsTUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRTtZQUMxQixNQUFNLEVBQUU7Z0JBQ0osS0FBSyxFQUFPLE1BQU07Z0JBQ2xCLFVBQVUsRUFBRSxLQUFLO2FBQ3BCO1lBQ0QsUUFBUSxFQUFFO2dCQUNOLEtBQUssRUFBTyxHQUFHO2dCQUNmLFVBQVUsRUFBRSxLQUFLO2FBQ3BCO1lBQ0QsT0FBTyxFQUFFO2dCQUNMLEtBQUssRUFBTyxPQUFPO2dCQUNuQixVQUFVLEVBQUUsS0FBSzthQUNwQjtTQUNKLENBQUMsQ0FBQztRQUVILElBQUksT0FBTyxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsVUFBVSxPQUFPLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQy9FLE1BQU0sTUFBTSxHQUFHLDBCQUFnQixDQUFDLGFBQWEsQ0FBQyxPQUFrQyxDQUFDLENBQUM7UUFDbEYsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3RCLE9BQU8sSUFBSSxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUM1QyxDQUFDO1FBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQ2hFLENBQUM7YUFBTSxDQUFDO1lBQ0osS0FBSyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3BELENBQUM7SUFDTCxDQUFDO0lBRUQsSUFBSSxPQUFPO1FBQ1AsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztJQUNqQyxDQUFDO0lBQ0QsSUFBSSxJQUFJO1FBQ0osT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUMvQyxDQUFDO0lBQ0QsSUFBSSxNQUFNO1FBQ04sT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztJQUNoQyxDQUFDO0lBQ0QsSUFBSSxVQUFVO1FBQ1YsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQztJQUNwQyxDQUFDO0lBRUQsTUFBTTtRQUNGLE9BQU87WUFDSCxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDckIsTUFBTSxFQUFHLElBQUksQ0FBQyxNQUFNO1lBQ3BCLElBQUksRUFBSyxJQUFJLENBQUMsSUFBSTtZQUNsQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDckIsS0FBSyxFQUFJLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRTtTQUM1QixDQUFDO0lBQ04sQ0FBQztDQUNKO0FBM0RELG1DQTJEQyJ9