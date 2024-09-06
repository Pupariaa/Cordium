// globals.d.ts

import { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  Events, 
  ChannelType, 
  PermissionFlagsBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  StringSelectMenuBuilder, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle,
  Guild,
  GuildMember,
  Message,
  Channel,
  Collection,
  TextChannel
} from 'discord.js';
import AttachmentManager from '../src/common/AttachmentManager';
import { Channels } from '../src/common/Statics';

declare global {
  namespace NodeJS {
    interface Global {
      triggers: {
        nameOfTrigger: (message: Message) => Promise<void>;  // Use specific type from discord.js
        // CLIMarker#04
      };
      client: Client;
      attachment: AttachmentManager;
      Channel: Channels;  // Correctly typed Channel as Channels
      GatewayIntentBits: typeof GatewayIntentBits;
      Partials: typeof Partials;
      ChannelType: typeof ChannelType;  // Fixed missing typeof
      PermissionFlagsBits: typeof PermissionFlagsBits;
      EmbedBuilder: typeof EmbedBuilder;
      ActionRowBuilder: typeof ActionRowBuilder;
      ButtonBuilder: typeof ButtonBuilder;
      ButtonStyle: typeof ButtonStyle;
      StringSelectMenuBuilder: typeof StringSelectMenuBuilder;
      ModalBuilder: typeof ModalBuilder;
      TextInputBuilder: typeof TextInputBuilder;
      TextInputStyle: typeof TextInputStyle;
      Events_IntegrationCreate: typeof Events.InteractionCreate;  // Fixed missing typeof
    }
  }
  
  var triggers: {
    nameOfTrigger: (message: Message) => Promise<void>;  // Use specific type from discord.js
    // CLIMarker#05
  };
  
  var client: Client;
  var attachment: AttachmentManager;
  var Channel: Channels;  // Correctly typed Channel as Channels
  var GatewayIntentBits: typeof GatewayIntentBits;
  var Partials: typeof Partials;
  var ChannelType: typeof ChannelType;  // Fixed missing typeof
  var PermissionFlagsBits: typeof PermissionFlagsBits;
  var EmbedBuilder: typeof EmbedBuilder;
  var ActionRowBuilder: typeof ActionRowBuilder;
  var ButtonBuilder: typeof ButtonBuilder;
  var ButtonStyle: typeof ButtonStyle;
  var StringSelectMenuBuilder: typeof StringSelectMenuBuilder;
  var ModalBuilder: typeof ModalBuilder;
  var TextInputBuilder: typeof TextInputBuilder;
  var TextInputStyle: typeof TextInputStyle;
  var Events_IntegrationCreate: typeof Events.InteractionCreate;  // Fixed missing typeof
}

export { };
