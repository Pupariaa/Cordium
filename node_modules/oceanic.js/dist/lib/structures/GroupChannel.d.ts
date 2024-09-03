/** @module GroupChannel */
import Channel from "./Channel";
import User from "./User";
import type ClientApplication from "./ClientApplication";
import type { ChannelTypes, ImageFormat } from "../Constants";
import type Client from "../Client";
import type { AddGroupRecipientOptions, EditGroupDMOptions, RawGroupChannel } from "../types/channels";
import type { RawUser } from "../types/users";
import TypedCollection from "../util/TypedCollection";
import type { JSONGroupChannel } from "../types/json";
/** Represents a group direct message. */
export default class GroupChannel extends Channel {
    /** The application that made this group channel. */
    application?: ClientApplication;
    /** The ID of the application that made this group channel. */
    applicationID: string;
    /** The icon hash of this group, if any. */
    icon: string | null;
    /** The ID of last message sent in this channel. */
    lastMessageID: string | null;
    /** If this group channel is managed by an application. */
    managed: boolean;
    /** The name of this group channel. */
    name: string | null;
    /** The nicknames used when creating this group channel. */
    nicks: Array<Record<"id" | "nick", string>>;
    /** The owner of this group channel. */
    owner?: User;
    /** The ID of the owner of this group channel. */
    ownerID: string;
    /** The other recipients in this group channel. */
    recipients: TypedCollection<RawUser, User>;
    type: ChannelTypes.GROUP_DM;
    constructor(data: RawGroupChannel, client: Client);
    protected update(data: Partial<RawGroupChannel>): void;
    /**
     * Add a user to this channel.
     * @param options The options for adding the user.
     */
    addRecipient(options: AddGroupRecipientOptions): Promise<void>;
    /**
     * Edit this channel.
     * @param options The options for editing the channel.
     */
    edit(options: EditGroupDMOptions): Promise<this>;
    /**
     * The url of this application's icon.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    iconURL(format?: ImageFormat, size?: number): string | null;
    /**
     * Remove a user from this channel.
     * @param userID The ID of the user to remove.
     */
    removeRecipient(userID: string): Promise<void>;
    /**
     * Show a typing indicator in this channel.
     */
    sendTyping(): Promise<void>;
    toJSON(): JSONGroupChannel;
}
