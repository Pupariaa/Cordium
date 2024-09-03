/** @module Team */
import Base from "./Base";
import type User from "./User";
import type Client from "../Client";
import type { RawTeam, TeamMember } from "../types/applications";
import type { JSONTeam } from "../types/json";
/** Represents an OAuth team. */
export default class Team extends Base {
    /** The icon hash of this team. */
    icon: string | null;
    /** The members of this team. */
    members: Array<TeamMember>;
    /** The name of this team. */
    name: string;
    /** The owner of this team. */
    owner?: User;
    /** The ID of the owner of this team. */
    ownerID: string;
    constructor(data: RawTeam, client: Client);
    protected update(data: Partial<RawTeam>): void;
    toJSON(): JSONTeam;
}
