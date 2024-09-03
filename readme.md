## Configure a envs
#### into config.env
- discord_cqd_token : "a discord bot token"
- discord_cqd_id : "a discord bot id"
- discord_guid : "a guid of your discord server"
- restrictRole : "roleId" create a restricted role


## Add a text chat to the global global.Channel.send(channename, content)
#### into config.env
- add env variable: channelname : channelid

into src/common/Static.js:
- add channelname into typedef
```js
/**
 * @typedef {channename} TextChannelNames
 */
```
and 
```ts
/**
 * @typedef {channename} ChannelName
 */
```

```js
this.channels = {
    channename: process.env.channelname
};
```

## Add Messages triggers
#### into src/common/Triggers
- create a file 
copy-past a basecode

```js
global.triggers = global.triggers || {};
global.triggers.yourTrigger = async function yourTrigger(message) {
    //Your code
};
module.exports = {}
```
#### into types/global.t.ts
```js
declare global {
  namespace NodeJS {
    interface Global {
      triggers: {
        yourTrigger: (message: any) => Promise<void>;

      }
    }
  }
  var triggers: {
    yourTrigger: (message: any) => Promise<void>;
  };
};
```

### Global property

### send a message
#### into any files
```js
await global.channel.send('channelname', 'content');
```

### get a client
#### into any files
```js
const client = global.client
```


# Commands Handlers 
#### into src/commands/hendlers

- create a new file "name of command".js
copy-past basecode 
```js
const {SlashCommandBuilder} = require('discord.js');

const filePath = 'src/commands/handlers/ping.js';
require('../../logutils')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription(`ping the bot`),

    /**
     * Executes the 'ping' command.
     * @param {Object} interaction - The interaction object from Discord.js.
     */
    async execute(interaction) {
        const functionName = 'execute';
        try {
            await interaction.reply('pong')
        } catch (err) {
            console.error(`${filePath} - Line ${__line} (${functionName}): Error executing command:`, err);
        }
    }
};

```


# Logs
## Console logger
### basics
#### into any files
```js
console.log('log')
```
#### into any files
```js
console.error('error')
```
#### into any files
```js
console.info('info')
```

### With more infos
#### into any files
```js
//before, include a method and filename
require(path.resolve(__dirname, '../../logutils'));
const filePath = path.resolve(__dirname, 'yourfile.js');


console.error(`${filePath} - Line ${__line} (${functionName}): Error executing:`, err);
```

# sandbox
#### into src/comon/sandbox

specify your code

type a !sb command on any channel on your server

don't restart the bot

# Prototypes
## hasRole
## GuidMembers.prototypes
####  into any files
```js
global.client.hasRole(rolename)
```

## isAdministrator and more roles
#### into src/common/Prototypes/GuidMember.js
set a role name of props
```js
GuildMember.prototype.isModerator = function() {
    return this.hasRole('moderator');
};
```

#### into any files
```js
member.client.isAdministrator()
```

## Client.prototypes
#### into any files
```js
global.client.fetchGuildsInfo().then(guildInfos => {})
//or 
const guildInfo = await global.client.fetchGuildsInfo()
```
```js
global.client.registerCommand(...data).then(command => {})
//or
const commandData = await global.client.registerCommand(...data)
```

```js
global.client.findChannelByName(channelname).then(channelObject => {})
//or
const channel = await global.client.findChannelByName(channelname)
```

```js
await global.client.sendMessageToChannel(channelname, content)
```

```js
const member = global.client.getUserByUsername(username)
```

```js
const member = global.client.getMemberById(userid)
```


