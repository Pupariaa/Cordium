"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** @module GroupChannel */
const Channel_1 = tslib_1.__importDefault(require("./Channel"));
const User_1 = tslib_1.__importDefault(require("./User"));
const Routes = tslib_1.__importStar(require("../util/Routes"));
const TypedCollection_1 = tslib_1.__importDefault(require("../util/TypedCollection"));
/** Represents a group direct message. */
class GroupChannel extends Channel_1.default {
    /** The application that made this group channel. */
    application;
    /** The ID of the application that made this group channel. */
    applicationID;
    /** The icon hash of this group, if any. */
    icon;
    /** The ID of last message sent in this channel. */
    lastMessageID;
    /** If this group channel is managed by an application. */
    managed;
    /** The name of this group channel. */
    name;
    /** The nicknames used when creating this group channel. */
    nicks;
    /** The owner of this group channel. */
    owner;
    /** The ID of the owner of this group channel. */
    ownerID;
    /** The other recipients in this group channel. */
    recipients;
    constructor(data, client) {
        super(data, client);
        this.applicationID = data.application_id;
        this.icon = null;
        this.lastMessageID = data.last_message_id;
        this.managed = false;
        this.name = data.name;
        this.nicks = [];
        this.owner = this.client.users.get(data.owner_id);
        this.ownerID = data.owner_id;
        this.recipients = new TypedCollection_1.default(User_1.default, client, Infinity, {
            construct: (user) => client.users.update(user)
        });
        for (const r of data.recipients)
            this.recipients.update(r);
        this.update(data);
    }
    update(data) {
        super.update(data);
        if (data.application_id !== undefined) {
            this.application = this.client["_application"] && this.client.application.id === data.application_id ? this.client.application : undefined;
            this.applicationID = data.application_id;
        }
        if (data.icon !== undefined) {
            this.icon = data.icon;
        }
        if (data.last_message_id !== undefined) {
            this.lastMessageID = data.last_message_id;
        }
        if (data.managed !== undefined) {
            this.managed = data.managed;
        }
        if (data.name !== undefined) {
            this.name = data.name;
        }
        if (data.nicks !== undefined) {
            this.nicks = data.nicks;
        }
        if (data.owner_id !== undefined) {
            this.owner = this.client.users.get(data.owner_id);
            this.ownerID = data.owner_id;
        }
        if (data.type !== undefined) {
            this.type = data.type;
        }
        if (data.recipients !== undefined) {
            this.recipients.clear();
            for (const r of data.recipients) {
                this.recipients.update(r);
            }
        }
    }
    /**
     * Add a user to this channel.
     * @param options The options for adding the user.
     */
    async addRecipient(options) {
        return this.client.rest.channels.addGroupRecipient(this.id, options);
    }
    /**
     * Edit this channel.
     * @param options The options for editing the channel.
     */
    async edit(options) {
        return this.client.rest.channels.edit(this.id, options);
    }
    /**
     * The url of this application's icon.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    iconURL(format, size) {
        return this.icon === null ? null : this.client.util.formatImage(Routes.APPLICATION_ICON(this.applicationID, this.icon), format, size);
    }
    /**
     * Remove a user from this channel.
     * @param userID The ID of the user to remove.
     */
    async removeRecipient(userID) {
        return this.client.rest.channels.removeGroupRecipient(this.id, userID);
    }
    /**
     * Show a typing indicator in this channel.
     */
    async sendTyping() {
        return this.client.rest.channels.sendTyping(this.id);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            applicationID: this.applicationID,
            icon: this.icon,
            managed: this.managed,
            name: this.name,
            nicks: this.nicks,
            ownerID: this.ownerID,
            recipients: this.recipients.map(user => user.toJSON()),
            type: this.type
        };
    }
}
exports.default = GroupChannel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3JvdXBDaGFubmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3N0cnVjdHVyZXMvR3JvdXBDaGFubmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJCQUEyQjtBQUMzQixnRUFBZ0M7QUFDaEMsMERBQTBCO0FBSTFCLCtEQUF5QztBQUd6QyxzRkFBc0Q7QUFHdEQseUNBQXlDO0FBQ3pDLE1BQXFCLFlBQWEsU0FBUSxpQkFBTztJQUM3QyxvREFBb0Q7SUFDcEQsV0FBVyxDQUFxQjtJQUNoQyw4REFBOEQ7SUFDOUQsYUFBYSxDQUFTO0lBQ3RCLDJDQUEyQztJQUMzQyxJQUFJLENBQWdCO0lBQ3BCLG1EQUFtRDtJQUNuRCxhQUFhLENBQWdCO0lBQzdCLDBEQUEwRDtJQUMxRCxPQUFPLENBQVU7SUFDakIsc0NBQXNDO0lBQ3RDLElBQUksQ0FBZ0I7SUFDcEIsMkRBQTJEO0lBQzNELEtBQUssQ0FBdUM7SUFDNUMsdUNBQXVDO0lBQ3ZDLEtBQUssQ0FBUTtJQUNiLGlEQUFpRDtJQUNqRCxPQUFPLENBQVM7SUFDaEIsa0RBQWtEO0lBQ2xELFVBQVUsQ0FBaUM7SUFFM0MsWUFBWSxJQUFxQixFQUFFLE1BQWM7UUFDN0MsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDekMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQzFDLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxD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