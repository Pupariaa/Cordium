'use strict';
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

const { __cfn, __cf } = eval(require(`current_filename`));
const { report, reportWarn, reportError } = console.createReports(__cf);

const wait = require('node:timers/promises').setTimeout;

const cmdName = 'search';
const cmdDescription = 'run a search and report matches';

function get_content(msg) {
    return [msg.content];
}

function get_embeds_url(msg) {
    const r = [];
    for (const embed of msg.embeds) {
        r.push(embed.url);
    }
    return r;
}

function get_embeds_title(msg) {
    const r = [];
    for (const embed of msg.embeds) {
        r.push(embed.title);
    }
    return r;
}

function get_embeds_description(msg) {
    const r = [];
    for (const embed of msg.embeds) {
        r.push(embed.description);
    }
    return r;
}

function get_attachments_url(msg) {
    const r = [];
    for (const attachment of msg.attachments.values()) {
        r.push(attachment.url);
    }
    return r;
}

function get_attachments_filename(msg) {
    const r = [];
    for (const attachment of msg.attachments.values()) {
        r.push(attachment.filename);
    }
    return r;
}

function get_attachments_description(msg) {
    const r = [];
    for (const attachment of msg.attachments.values()) {
        r.push(attachment.description);
    }
    return r;
}

const SearchType = {
    content: get_content,
    embeds_url: get_embeds_url,
    embeds_title: get_embeds_title,
    embeds_description: get_embeds_description,
    attachments_url: get_attachments_url,
    attachments_filename: get_attachments_filename,
    attachments_description: get_attachments_description
};

const gets = [
    SearchType.content,
    SearchType.embeds_url,
    SearchType.embeds_title,
    SearchType.embeds_description,
    SearchType.attachments_url,
    SearchType.attachments_filename,
    SearchType.attachments_description
];

function log_matches(matches, replyObject) {
    const functionName = 'log_matches';
    for (const result of matches) report(__line, functionName, result);
}

function report_matches(matches, replyObject) {
    replyObject.files = [
        new AttachmentBuilder(Buffer.from(JSON.stringify(matches, null, 4)), {name: 'matches.json'})
    ];
}

function link_matches(matches, replyObject) {
    const limit = 10;
    const n = Math.min(limit, matches.length);
    if (matches.length > limit) replyObject.content += `\nFirst ${n} matches:`;
    for (const result of matches.slice(0, n)) {
        const date = new Date(result.createdTimestamp + global.utc_diff);
        const dateString = `${date.getUTCFullYear()}/${date.getUTCMonth()}/${date.getUTCDate()} ${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}:${String(date.getUTCSeconds()).padStart(2, '0')}`;
        replyObject.content += `\n- [${result.channel.name} > ${result.author.username} > ${dateString}](<https://discord.com/channels/${global.guild.id}/${result.channel.id}/${result.id}>)`;
    }
}

const reporters = [log_matches, link_matches, report_matches];

function generateChannelNamesChoices() {
    const r = [];
    for (const [ channelName, channelAlias ] of Object.entries(global.channels.text.channels)) {
        if (channelAlias.tags.includes('boulot')) {
            r.push({ name: channelName, value: JSON.stringify([channelName]) });
        }
    }
    return r;
}

function querySummary(regex, types, channelsName) {
    const selectedTypes = types.map(type => type.name.substring(4).replace('_', ' ')).join(', ');
    const selectedChannels = channelsName.map(channelName => channelName.replace('_', '-')).join(', ');
    return `Regex: ${regex}\nTypes: ${selectedTypes}\nChannels: ${selectedChannels}`;
}

/**
 * Process a channel with a regex
 * @param {string} channelName - the name of the channel to search in
 * @param {function | string} types - the types of the search
 * @param {RegExp} regex - the regex to search for
 * @param {Object} matches - the matches of the search
 */
async function process_messages(messages, types, regex, matches) {
    for (const msg of messages) {
        let found = false;
        for (const type of types) {
            const texts = type(msg);
            for (const text of texts) {
                if (regex.test(text)) {
                    matches.push(msg);
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
    }
}

/**
 * Search for a regex in all the text channels of the server, in all the messages
 * @param {RegExp} regex - the regex to run on the extracted texts
 * @param {function[]} types - functions to extract a text from a message (all of SearchType by default)
 * @param {string[]} channelsName - the names of the channels to search in (all in global.channels.text by default)
 * @returns {Promise<Message[]>} - the messages that contain at least a match from the texts extracted
 */
async function search(regex, types = null, channelsName = null) {

    if (!types) {
        types = [...gets];
    }
    
    if (!channelsName) {
        channelsName = getBoulotChannelsName();
    }

    const matches = [];
    const promises = channelsName.map(async channelName => {
        const channel = global.channels.getByName(channelName);
        const messages = await channel.fetchAllMessages();
        return process_messages(messages, types, regex, matches);
    });

    await Promise.all(promises);

    return matches;
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName(cmdName)
    .setDescription(cmdDescription)
    .addStringOption(option =>
        option.setName('regex')
            .setDescription('the regex to search for')
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('type')
            .setDescription('what to search through (all by default)')
            .setRequired(false)
            .addChoices(
                { name: 'content', value: JSON.stringify([0]) },
                { name: 'embeds url', value: JSON.stringify([1]) },
                { name: 'embeds title', value: JSON.stringify([2]) },
                { name: 'embeds description', value: JSON.stringify([3]) },
                { name: 'images url', value: JSON.stringify([4]) },
                { name: 'images filename', value: JSON.stringify([5]) },
                { name: 'images description (alt text)', value: JSON.stringify([6]) }
            )
    )
    .addStringOption(option =>
        option.setName('channel_name')
            .setDescription('the channel to search in (all by default)')
            .setRequired(false)
            .addChoices(generateChannelNamesChoices())
    )
    .addStringOption(option =>
        option.setName('flags')
            .setDescription('flags of the regex')
            .setRequired(false)
            .addChoices(
                { name: "global - Don't return after first match", value: 'g' },
                { name: "multiline - ^ and $ match start/end of line", value: 'm' },
                { name: "insensitive - Case insensitive match", value: 'i' },
                { name: "extended - Ignore whitespace", value: 'x' },
                { name: "single line - Don't matches newline", value: 's' },
                { name: "unicode - Match with full unicode", value: 'u' },
                { name: "Ungreedy - Make quantifiers lazy", value: 'U' },
                { name: "Anchored - Anchor to start of pattern, or at the end of the most recent match", value: 'A' },
                { name: "Jchanged - Allow duplicate subpattern names", value: 'J' },
                { name: "Dollar end only - matches only end of pattern", value: 'D' }
            )
    )
    .addStringOption(option =>
        option.setName('output_format')
            .setDescription('matches output format (all by default)')
            .setRequired(false)
            .addChoices(
                { name: 'Console log', value: JSON.stringify([0]) },
                { name: 'Messages link (hard limit of 10)', value: JSON.stringify([1]) },
                { name: 'Json report file', value: JSON.stringify([2]) }
            )
    ),

    /**
     * Executes the 'search' command.
     * @param {Object} interaction - The interaction object from Discord.js.
     */
    async execute(interaction) {
        const functionName = 'execute';
        try {
            const regex = new RegExp(interaction.options.getString('regex'), interaction.options.getString('flags') || '');
            const types = JSON.parse(interaction.options.getString('type'))?.map(type => gets[type]) || [...gets];
            const channelsName = JSON.parse(interaction.options.getString('channel_name')) || [...Object.keys(global.channels.text.channels)];
            const matches = await search(
                regex,
                types,
                channelsName
            );

            const output_format = interaction.options.getString('output_format');
            const reportFunctions = output_format ? JSON.parse(output_format) : [...Array(reporters.length).keys()];

            const replyObject = {
                ephemeral: false,
                content: ''
            };
            for (const reportFunction of reportFunctions) {
                reporters[reportFunction](matches, replyObject);
            }

            if (reportFunctions.length === 1 && reportFunctions[0] === 0) {
                await interaction.reply({
                    ephemeral: true,
                    content: 'done'
                });
                await wait(5000);
                await interaction.deleteReply();
            }
            else {
                replyObject.content = `${querySummary(regex, types, channelsName)}\n\nFound **${matches.length}** matches` + replyObject.content;
                await interaction.reply(replyObject);
            }
        } catch (err) {
            reportError(__line, functionName, err);
            await interaction.reply({ content: `${cmdName} failed`, ephemeral: true });
            await wait(5000);
            await interaction.deleteReply();
        }
    },

    SearchType,
    search
};
