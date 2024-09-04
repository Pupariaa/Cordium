// globals.d.ts
import { Guild, GuildMember, Message, Channel, Collection, TextChannel, ButtonStyle } from 'discord.js';
import { Client, GatewayIntentBits, Partials, Events, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import AttachmentManager from '../src/common/AttachmentManager';
import { Channels, Statics } from '../src/common/Statics';


declare module 'discord.js' {
  interface Client {
    registerCommand: (commandName: string, callback: (message: Message, args: string[]) => void) => void;
    executeCommand: (commandName: string, message: Message, args: string[]) => void;

    findChannelByName: (channelName: string) => Channel | null;
    sendMessageToChannel: (channelName: string, message: string) => Promise<void>;
    broadcastMessage: (message: string) => Promise<void>;
    getUserByUsername: (username: string) => Promise<GuildMember | null>;
    fetchGuildsInfo: () => Array<{ name: string; id: string; channels: Array<{ name: string; id: string; type: string }> }>;
    setupAutoReconnect: () => void;
    getMemberById: (userId: string) => GuildMember | null;

    rateLimitCheck: () => void;
  }
  interface GuildMember {
    hasRole(roleName: string): boolean;
    isModerator(): boolean;
    isAdministrator(): boolean;
    isHelper(): boolean;
    isAnimator(): boolean;
    isFondator(): boolean;
    isBot(): boolean;
  }
}

declare global {
  namespace NodeJS {
    interface Global {
      triggers: {
        nameOfTrigger: (message: any) => Promise<void>;
        //CLIMarker#04

      }
    }
  }
  var triggers: {
    nameOfTrigger: (message: any) => Promise<void>;
    //CLIMarker#05

  };


  var client: Client;
  var attachment: AttachmentManager;
  var Channel: Channels;
  var Statics: Statics;
  var client: Client;
  var GatewayIntentBits: typeof GatewayIntentBits;
  var Partials: typeof Partials;
  var ChannelType: ChannelType;
  var PermissionFlagsBits: typeof PermissionFlagsBits;
  var EmbedBuilder: EmbedBuilder;
  var ActionRowBuilder: ActionRowBuilder;
  var ButtonBuilder: ButtonBuilder;
  var ButtonStyle: ButtonStyle;
  var StringSelectMenuBuilder: StringSelectMenuBuilder;
  var ModalBuilder: ModalBuilder;
  var TextInputBuilder: TextInputBuilder;
  var TextInputStyle: TextInputStyle;
  var Events_IntegrationCreate: Events.InteractionCreate;

}

export { };