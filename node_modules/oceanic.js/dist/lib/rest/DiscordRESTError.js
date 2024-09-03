"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** A REST error received from Discord. */
class DiscordRESTError extends Error {
    code;
    method;
    name = "DiscordRESTError";
    resBody;
    response;
    constructor(res, resBody, method, stack) {
        // eslint-disable-next-line unicorn/custom-error-definition
        super();
        this.code = Number(resBody.code);
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
        let message = "message" in resBody ? `${resBody.message} on ${this.method} ${this.path}` : `Unknown Error on ${this.method} ${this.path}`;
        if ("errors" in resBody) {
            message += `\n ${DiscordRESTError.flattenErrors(resBody.errors).join("\n ")}`;
        }
        else {
            const errors = DiscordRESTError.flattenErrors(resBody);
            if (errors.length !== 0) {
                message += `\n ${errors.join("\n ")}`;
            }
        }
        this.message = message;
        if (stack) {
            this.stack = `${this.name}: ${this.message}\n${stack}`;
        }
        else {
            Error.captureStackTrace(this, DiscordRESTError);
        }
    }
    static flattenErrors(errors, keyPrefix = "") {
        let messages = [];
        for (const fieldName in errors) {
            if (!Object.hasOwn(errors, fieldName) || fieldName === "message" || fieldName === "code") {
                continue;
            }
            if (typeof errors[fieldName] === "object" && errors[fieldName] !== null) {
                if ("_errors" in errors[fieldName]) {
                    messages = messages.concat(errors[fieldName]._errors.map((err) => `${`${keyPrefix}${fieldName}`}: ${err.message}`));
                }
                else if (Array.isArray(errors[fieldName])) {
                    messages = messages.concat(errors[fieldName].map(str => `${`${keyPrefix}${fieldName}`}: ${typeof str === "object" && "message" in str ? str.message : str}`));
                }
                else {
                    messages = messages.concat(DiscordRESTError.flattenErrors(errors[fieldName], `${keyPrefix}${fieldName}.`));
                }
            }
        }
        return messages;
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
exports.default = DiscordRESTError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzY29yZFJFU1RFcnJvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9yZXN0L0Rpc2NvcmRSRVNURXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSwwQ0FBMEM7QUFDMUMsTUFBcUIsZ0JBQWlCLFNBQVEsS0FBSztJQUMvQyxJQUFJLENBQVM7SUFDYixNQUFNLENBQWM7SUFDWCxJQUFJLEdBQUcsa0JBQWtCLENBQUM7SUFDbkMsT0FBTyxDQUFrQztJQUN6QyxRQUFRLENBQVk7SUFDcEIsWUFBWSxHQUFhLEVBQUUsT0FBZ0MsRUFBRSxNQUFrQixFQUFFLEtBQWM7UUFDM0YsMkRBQTJEO1FBQzNELEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUU7WUFDMUIsTUFBTSxFQUFFO2dCQUNKLEtBQUssRUFBTyxNQUFNO2dCQUNsQixVQUFVLEVBQUUsS0FBSzthQUNwQjtZQUNELFFBQVEsRUFBRTtnQkFDTixLQUFLLEVBQU8sR0FBRztnQkFDZixVQUFVLEVBQUUsS0FBSzthQUNwQjtZQUNELE9BQU8sRUFBRTtnQkFDTCxLQUFLLEVBQU8sT0FBTztnQkFDbkIsVUFBVSxFQUFFLEtBQUs7YUFDcEI7U0FDSixDQUFDLENBQUM7UUFFSCxJQUFJLE9BQU8sR0FBRyxTQUFTLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFJLE9BQStCLENBQUMsT0FBTyxPQUFPLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbkssSUFBSSxRQUFRLElBQUksT0FBTyxFQUFFLENBQUM7WUFDdEIsT0FBTyxJQUFJLE1BQU0sZ0JBQWdC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