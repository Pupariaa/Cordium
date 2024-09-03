/** @module Permission */
import { Permissions, type PermissionName as PermissionNames } from "../Constants";
import type { JSONPermission } from "../types/json";
/** Represents a permission. */
export default class Permission {
    private _json;
    /** The allowed permissions for this permission instance. */
    allow: bigint;
    /** The denied permissions for this permission instance. */
    deny: bigint;
    constructor(allow: bigint | string, deny?: bigint | string);
    /** A key-value map of permission to if it's been allowed or denied (not present if neither) */
    get json(): Partial<Record<keyof typeof Permissions, boolean>>;
    /**
     * Check if this permissions instance has the given permissions allowed
     * @param permissions The permissions to check for.
     */
    has(...permissions: Array<PermissionNames | bigint>): boolean;
    toJSON(): JSONPermission;
    toString(): string;
}
