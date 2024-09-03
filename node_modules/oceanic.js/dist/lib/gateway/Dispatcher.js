"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const DefaultDispatchEvents = tslib_1.__importStar(require("./events"));
class Dispatcher {
    manager;
    events = new Map();
    constructor(manager) {
        Object.defineProperty(this, "manager", {
            value: manager,
            writable: false,
            enumerable: false,
            configurable: false
        });
        const type = this.manager.options.dispatcher.blacklist === null ? "blacklist" :
            (this.manager.options.dispatcher.whitelist === null ? "whitelist" : "none");
        for (const [event, fn] of Object.entries(DefaultDispatchEvents)) {
            if (type === "none" ||
                (type === "whitelist" && this.manager.options.dispatcher.whitelist?.includes(event)) ||
                (type === "blacklist" && !this.manager.options.dispatcher.blacklist?.includes(event))) {
                this.register(event, fn);
            }
        }
    }
    handle(data, shard) {
        const event = data.t;
        if (!this.events.has(event))
            return;
        const arr = this.events.get(event);
        for (const fn of arr)
            fn(data.d, shard);
    }
    register(event, fn, replace = false) {
        if (!this.events.has(event))
            this.events.set(event, []);
        const arr = this.events.get(event);
        if (replace && arr.length !== 0)
            arr.splice(0, arr.length);
        arr.push(fn);
    }
    unregister(event, fn) {
        if (!this.events.has(event))
            return;
        const arr = this.events.get(event);
        if (fn) {
            const index = arr.indexOf(fn);
            if (index !== -1)
                arr.splice(index, 1);
        }
        else
            arr.splice(0, arr.length);
    }
}
exports.default = Dispatcher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9nYXRld2F5L0Rpc3BhdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0Esd0VBQWtEO0FBUWxELE1BQXFCLFVBQVU7SUFDbkIsT0FBTyxDQUFnQjtJQUMvQixNQUFNLEdBQWdELElBQUksR0FBRyxFQUFFLENBQUM7SUFDaEUsWUFBWSxPQUFxQjtRQUM3QixNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDbkMsS0FBSyxFQUFTLE9BQU87WUFDckIsUUFBUSxFQUFNLEtBQUs7WUFDbkIsVUFBVSxFQUFJLEtBQUs7WUFDbkIsWUFBWSxFQUFFLEtBQUs7U0FDdEIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzNFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFaEYsS0FBSyxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQTZDLEVBQUUsQ0FBQztZQUMxRyxJQUFJLElBQUksS0FBSyxNQUFNO2dCQUNmLENBQUMsSUFBSSxLQUFLLFdBQVcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDcEYsQ0FBQyxJQUFJLEtBQUssV0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUN4RixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM3QixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFTyxNQUFNLENBQUMsSUFBdUIsRUFBRSxLQUFZO1FBQ2hELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztZQUFFLE9BQU87UUFDcEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFFLENBQUM7UUFDcEMsS0FBSyxNQUFNLEVBQUUsSUFBSSxHQUFHO1lBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELFFBQVEsQ0FBMEIsS0FBUSxFQUFFLEVBQXVCLEVBQUUsT0FBTyxHQUFHLEtBQUs7UUFDaEYsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztZQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN4RCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUUsQ0FBQztRQUNwQyxJQUFJLE9BQU8sSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUM7WUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0QsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFXLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQsVUFBVSxDQUEwQixLQUFRLEVBQUUsRUFBd0I7UUFDbEUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztZQUFFLE9BQU87UUFDcEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFFLENBQUM7UUFDcEMsSUFBSSxFQUFFLEVBQUUsQ0FBQztZQUNMLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBVyxDQUFDLENBQUM7WUFDdkMsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDO2dCQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNDLENBQUM7O1lBQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3JDLENBQUM7Q0FDSjtBQTdDRCw2QkE2Q0MifQ==