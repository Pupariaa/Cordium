"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module SimpleCollection */
const Collection_1 = tslib_1.__importDefault(require("./Collection"));
/** This is an internal class, you should not use it in your projects. If you want a collection type for your own projects, look at {@link Collection}. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SimpleCollection extends Collection_1.default {
    conversionFunc;
    key;
    onDuplicate;
    limit;
    constructor(conversionFunc, limit = Infinity, onDuplicate = "throw", key) {
        super();
        this.limit = limit;
        Object.defineProperties(this, {
            conversionFunc: { value: conversionFunc, enumerable: false },
            key: { value: key ?? "id", enumerable: false },
            onDuplicate: { value: onDuplicate, enumerable: false }
        });
    }
    add(value) {
        if (this.key in value) {
            if (this.limit === 0) {
                return value;
            }
            if (this.has(value[this.key])) {
                switch (this.onDuplicate) {
                    case "merge": {
                        value = { ...this.get(value[this.key]), ...value };
                        break;
                    }
                    // we don't have the raw data, so we can't update
                    case "update":
                    case "throw": {
                        const err = new Error(`${this.constructor.name}#add: duplicate ${this.key} ${value[this.key]}`);
                        Object.defineProperty(err, "_object", { value });
                        throw err;
                    }
                }
            }
            this.set(value[this.key], value);
            if (this.limit && this.size > this.limit) {
                const iter = this.keys();
                while (this.size > this.limit) {
                    this.delete(iter.next().value);
                }
            }
            return value;
        }
        else {
            const err = new Error(`${this.constructor.name}#add: value must have a ${this.key} property`);
            Object.defineProperty(err, "_object", { value });
            throw err;
        }
    }
    update(value) {
        if (this.key in value) {
            if (this.has(value[this.key]) && this.onDuplicate === "update") {
                const obj = this.get(value[this.key]);
                if ("update" in obj && typeof obj.update === "function") {
                    obj.update(value);
                    return obj;
                }
                else {
                    const err = new Error(`${this.constructor.name}#update: existing object for ${value[this.key]} does not have an update method`);
                    Object.defineProperty(err, "_object", { value });
                    throw err;
                }
            }
            return this.add(this.conversionFunc(value));
        }
        else {
            const err = new Error(`${this.constructor.name}#update: value must have a ${this.key} property`);
            Object.defineProperty(err, "_object", { value });
            throw err;
        }
    }
}
exports.default = SimpleCollection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2ltcGxlQ29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi91dGlsL1NpbXBsZUNvbGxlY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0JBQStCO0FBQy9CLHNFQUFzQztBQUV0QywwSkFBMEo7QUFDMUosOERBQThEO0FBQzlELE1BQXFCLGdCQUFzSixTQUFRLG9CQUFnQjtJQUN2TCxjQUFjLENBQWtCO0lBQzlCLEdBQUcsQ0FBTztJQUNWLFdBQVcsQ0FBNEM7SUFDakUsS0FBSyxDQUFTO0lBQ2QsWUFBWSxjQUE4QixFQUFFLEtBQUssR0FBRyxRQUFRLEVBQUUsY0FBd0QsT0FBTyxFQUFFLEdBQVM7UUFDcEksS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFO1lBQzFCLGNBQWMsRUFBRSxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRTtZQUM1RCxHQUFHLEVBQWEsRUFBRSxLQUFLLEVBQUUsR0FBRyxJQUFJLElBQUksRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFO1lBQ3pELFdBQVcsRUFBSyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRTtTQUM1RCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsR0FBRyxDQUFjLEtBQVE7UUFDckIsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ3BCLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDbkIsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQztZQUNELElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDNUIsUUFBUSxJQUFJLENBQUMs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