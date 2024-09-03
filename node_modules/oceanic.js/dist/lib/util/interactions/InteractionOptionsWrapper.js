"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** @module InteractionOptionsWrapper */
const Errors_1 = require("../Errors");
const Constants_1 = require("../../Constants");
/** A wrapper for interaction options. */
class InteractionOptionsWrapper {
    /** The raw options from Discord.  */
    raw;
    /** The resolved data for this options instance. */
    resolved;
    constructor(data, resolved) {
        this.raw = data;
        this.resolved = resolved;
    }
    _getOption(name, required = false, type) {
        const opt = this.getOptions().find(o => o.name === name && o.type === type);
        if (!opt && required) {
            throw new Errors_1.WrapperError(`Missing required option: ${name}`);
        }
        else {
            return opt;
        }
    }
    getAttachment(name, required) {
        if (this.resolved === null) {
            throw new TypeError("Attempt to use getAttachment with null resolved. If this is on an autocomplete interaction, use getAttachmentOption instead.");
        }
        let val;
        if (!(val = this.getAttachmentOption(name, required)?.value)) {
            return undefined;
        }
        const a = this.resolved.attachments.get(val);
        if (!a && required) {
            throw new Errors_1.WrapperError(`Attachment not present for required option: ${name}`);
        }
        return a;
    }
    getAttachmentOption(name, required) {
        return this._getOption(name, required, Constants_1.ApplicationCommandOptionTypes.ATTACHMENT);
    }
    getBoolean(name, required) {
        return this.getBooleanOption(name, required)?.value;
    }
    getBooleanOption(name, required) {
        return this._getOption(name, required, Constants_1.ApplicationCommandOptionTypes.BOOLEAN);
    }
    getChannel(name, required) {
        if (this.resolved === null) {
            throw new TypeError("Attempt to use getChannel with null resolved. If this is on an autocomplete interaction, use getChannelOption instead.");
        }
        let val;
        if (!(val = this.getChannelOption(name, required)?.value)) {
            return undefined;
        }
        const ch = this.resolved.channels.get(val);
        if (!ch && required) {
            throw new Errors_1.WrapperError(`Channel not present for required option: ${name}`);
        }
        return ch;
    }
    getChannelOption(name, required) {
        return this._getOption(name, required, Constants_1.ApplicationCommandOptionTypes.CHANNEL);
    }
    getCompleteChannel(name, required) {
        const resolved = this.getChannel(name, required);
        if (!resolved) {
            return undefined; // required will be handled in getChannel
        }
        const channel = resolved.completeChannel ?? (resolved.type === Constants_1.ChannelTypes.DM ? resolved : undefined);
        if (!channel && required) {
            throw new Errors_1.WrapperError(`Failed to resolve complete channel for required option: ${name}`);
        }
        return channel;
    }
    getFocused(required) {
        const opt = this.getOptions().find(o => o.focused === true);
        if (!opt && required) {
            throw new Errors_1.WrapperError("Missing required focused option");
        }
        else {
            return opt;
        }
    }
    getInteger(name, required) {
        return this.getIntegerOption(name, required)?.value;
    }
    getIntegerOption(name, required) {
        return this._getOption(name, required, Constants_1.ApplicationCommandOptionTypes.INTEGER);
    }
    getMember(name, required) {
        if (this.resolved === null) {
            throw new TypeError("Attempt to use getMember with null resolved. If this is on an autocomplete interaction, use getUserOption instead.");
        }
        let val;
        if (!(val = this.getUserOption(name, required)?.value)) {
            return undefined;
        }
        const ch = this.resolved.members.get(val);
        if (!ch && required) {
            throw new Errors_1.WrapperError(`Member not present for required option: ${name}`);
        }
        return ch;
    }
    getMentionable(name, required) {
        if (this.resolved === null) {
            throw new TypeError("Attempt to use getMentionable with null resolved. If this is on an autocomplete interaction, use getAttachmentOption instead.");
        }
        let val;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        if (!(val = this._getOption(name, required, Constants_1.ApplicationCommandOptionTypes.MENTIONABLE)?.value)) {
            return undefined;
        }
        const role = this.resolved.roles.get(val);
        const user = this.resolved.users.get(val);
        if ((!role && !user) && required) {
            throw new Errors_1.WrapperError(`Value not present for required option: ${name}`);
        }
        return role ?? user;
    }
    getMentionableOption(name, required) {
        return this._getOption(name, required, Constants_1.ApplicationCommandOptionTypes.MENTIONABLE);
    }
    getNumber(name, required) {
        return this.getNumberOption(name, required)?.value;
    }
    getNumberOption(name, required) {
        return this._getOption(name, required, Constants_1.ApplicationCommandOptionTypes.NUMBER);
    }
    /** Get the options received in this interaction, excluding subcommands and subcommand groups. */
    getOptions() {
        let baseOptions;
        const sub = this.getSubCommand(false) ?? [];
        switch (sub.length) {
            case 0: {
                baseOptions = this.raw;
                break;
            }
            case 1: {
                baseOptions = this.raw.find(o => o.name === sub[0] && o.type === Constants_1.ApplicationCommandOptionTypes.SUB_COMMAND)?.options;
                break;
            }
            case 2: {
                baseOptions = this.raw.find(o => o.name === sub[0] && o.type === Constants_1.ApplicationCommandOptionTypes.SUB_COMMAND_GROUP)?.options?.find(o2 => o2.name === sub[1] && o2.type === Constants_1.ApplicationCommandOptionTypes.SUB_COMMAND)?.options;
                break;
            }
        }
        return baseOptions ?? [];
    }
    getRole(name, required) {
        if (this.resolved === null) {
            throw new TypeError("Attempt to use getRole with null resolved. If this is on an autocomplete interaction, use getRoleOption instead.");
        }
        let val;
        if (!(val = this.getRoleOption(name, required)?.value)) {
            return undefined;
        }
        const ch = this.resolved.roles.get(val);
        if (!ch && required) {
            throw new Errors_1.WrapperError(`Role not present for required option: ${name}`);
        }
        return ch;
    }
    getRoleOption(name, required) {
        return this._getOption(name, required, Constants_1.ApplicationCommandOptionTypes.ROLE);
    }
    getString(name, required) {
        return this.getStringOption(name, required)?.value;
    }
    getStringOption(name, required) {
        return this._getOption(name, required, Constants_1.ApplicationCommandOptionTypes.STRING);
    }
    getSubCommand(required) {
        const opt = this.raw.find(o => o.type === Constants_1.ApplicationCommandOptionTypes.SUB_COMMAND || o.type === Constants_1.ApplicationCommandOptionTypes.SUB_COMMAND_GROUP);
        if (opt?.options) {
            // nested
            if (opt.options.length === 1 && opt.type === Constants_1.ApplicationCommandOptionTypes.SUB_COMMAND_GROUP) {
                const sub = opt.options.find(o => o.type === Constants_1.ApplicationCommandOptionTypes.SUB_COMMAND);
                return sub?.options ? [opt.name, sub.name] : [opt.name];
            }
            else {
                return [opt.name];
            }
        }
        else {
            if (required) {
                throw new Errors_1.WrapperError("Missing required option: SubCommand/SubCommandGroup.");
            }
            else {
                return undefined;
            }
        }
    }
    getUser(name, required) {
        if (this.resolved === null) {
            throw new TypeError("Attempt to use getUser with null resolved. If this is on an autocomplete interaction, use getUseOption instead.");
        }
        let val;
        if (!(val = this.getUserOption(name, required)?.value)) {
            return undefined;
        }
        const ch = this.resolved.users.get(val);
        if (!ch && required) {
            throw new Errors_1.WrapperError(`User not present for required option: ${name}`);
        }
        return ch;
    }
    getUserOption(name, required) {
        return this._getOption(name, required, Constants_1.ApplicationCommandOptionTypes.USER);
    }
}
exports.default = InteractionOptionsWrapper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3Rpb25PcHRpb25zV3JhcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi91dGlsL2ludGVyYWN0aW9ucy9JbnRlcmFjdGlvbk9wdGlvbnNXcmFwcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0NBQXdDO0FBQ3hDLHNDQUF5QztBQUN6QywrQ0FBOEU7QUEwQjlFLHlDQUF5QztBQUN6QyxNQUFxQix5QkFBeUI7SUFDMUMscUNBQXFDO0lBQ3JDLEdBQUcsQ0FBNEI7SUFDL0IsbURBQW1EO0lBQ25ELFFBQVEsQ0FBbUQ7SUFDM0QsWUFBWSxJQUErQixFQUFFLFFBQTBEO1FBQ25HLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzdCLENBQUM7SUFFTyxVQUFVLENBQXNFLElBQVksRUFBRSxRQUFRLEdBQUcsS0FBSyxFQUFFLElBQW1DO1FBQ3ZKLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBa0IsQ0FBQztRQUM3RixJQUFJLENBQUMsR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ25CLE1BQU0sSUFBSSxxQkFBWSxDQUFDLDRCQUE0QixJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQy9ELENBQUM7YUFBTSxDQUFDO1lBQ0osT0FBTyxHQUFHLENBQUM7UUFDZixDQUFDO0lBQ0wsQ0FBQztJQVNELGFBQWEsQ0FBQyxJQUFZLEVBQUUsUUFBa0I7UUFDMUMsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ3pCLE1BQU0sSUFBSSxTQUFTLENBQUMsOEhBQThILENBQUMsQ0FBQztRQUN4SixDQUFDO1FBQ0QsSUFB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