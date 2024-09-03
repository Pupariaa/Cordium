/** @module PermissionOverwrite */
import Base from "./Base";
import Permission from "./Permission";
import type { OverwriteTypes, PermissionName as PermissionNames, Permissions } from "../Constants";
import type Client from "../Client";
import type { RawOverwrite } from "../types/channels";
import type { JSONPermissionOverwrite } from "../types/json";
/** Represents a permission overwrite. */
export default class PermissionOverwrite extends Base {
    /** The permissions of this overwrite. */
    permission: Permission;
    /** The type of this overwrite. `0` for role, `1` for user. */
    type: OverwriteTypes;
    constructor(data: RawOverwrite, client: Client);
    protected update(data: Partial<RawOverwrite>): void;
    get allow(): bigint;
    get deny(): bigint;
    /** A key-value map of permission to if it's been allowed or denied (not present if neither) */
    get json(): Partial<Record<keyof typeof Permissions, boolean>>;
    /**
     *Check if this permissions instance has the given permissions allowed
     * @param permissions The permissions to check for.
     */
    has(...permissions: Array<PermissionNames | bigint>): boolean;
    toJSON(): JSONPermissionOverwrite;
}
