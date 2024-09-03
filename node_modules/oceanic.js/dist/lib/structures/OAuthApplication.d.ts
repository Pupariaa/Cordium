/** @module OAuthApplication */
import type User from "./User";
import Team from "./Team";
import type Guild from "./Guild";
import Base from "./Base";
import type Client from "../Client";
import type { InstallParams } from "../types/oauth";
import type { IntegrationTypesConfig, RESTOAuthApplication } from "../types/applications";
import type { ApplicationIntegrationTypes, ImageFormat } from "../Constants";
import type { JSONOAuthApplication } from "../types/json";
/** Represents an oauth application. */
export default class OAuthApplication extends Base {
    private _cachedGuild?;
    /** When false, only the application's owners can invite the bot to guilds. */
    botPublic: boolean;
    /** When true, the applications bot will only join upon the completion of the full oauth2 code grant flow. */
    botRequireCodeGrant: boolean;
    /** This application's rich presence invite cover image hash, if any. */
    coverImage: string | null;
    /** This application's default custom authorization link, if any. */
    customInstallURL?: string;
    /** The description of the application. */
    description: string;
    /** This application's [public flags](https://discord.com/developers/docs/resources/application#application-object-application-flags). */
    flags: number;
    /** If this application is a game sold on Discord, the ID of the guild to which it has been linked. */
    guildID: string | null;
    /** The icon hash of the application. */
    icon: string | null;
    /** Settings for this application's in-app authorization link, if enabled. */
    installParams?: InstallParams;
    /** The install types available for this application. */
    integrationTypes: Array<ApplicationIntegrationTypes>;
    /** The configs for the install types available for this application. */
    integrationTypesConfig: IntegrationTypesConfig;
    /** The name of the application. */
    name: string;
    /** The owner of this application. */
    owner: User;
    /** The ID of the owner of this application. */
    ownerID: string;
    /** If this application is a game sold on Discord, the id of the Game's SKU. */
    primarySKUID?: string;
    /** A URL to this application's privacy policy. */
    privacyPolicyURL?: string;
    /** This application's role connections verification url. */
    roleConnectionsVerificationURL?: string;
    /** A list of rpc origin urls, if rpc is enabled. */
    rpcOrigins: Array<string>;
    /** If this application is a game sold on Discord, the slug that links to its store page. */
    slug?: string;
    /** The tags for this application. */
    tags?: Array<string>;
    /** The team that owns this application, if any. */
    team: Team | null;
    /** A URL to this application's terms of service. */
    termsOfServiceURL?: string;
    /** The type of this application. */
    type: number | null;
    /** The bot's hex encoded public key. */
    verifyKey: string;
    constructor(data: RESTOAuthApplication, client: Client);
    protected update(data: Partial<RESTOAuthApplication>): void;
    /** If this application is a game sold on Discord, the guild to which it has been linked. This will throw an error if the guild is not cached. */
    get guild(): Guild | null;
    /**
     * The url of this application's cover image.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    coverImageURL(format?: ImageFormat, size?: number): string | null;
    /**
     * The url of this application's icon.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    iconURL(format?: ImageFormat, size?: number): string | null;
    toJSON(): JSONOAuthApplication;
}
