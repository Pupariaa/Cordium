# Discord.js base bot
## Init this project

### Execute init
```ps
> npm run init
```
### Add Environnements variables
```ps
cn init --token "yourToken" --id "yourClientID" --guid "yourGuildID" --rsrole "yourRestrictedRoleID"
```

### Generate Link invitation
```ps
cn invite
```
### Add a channel in the codebase
#### Add text channel
```ps
cn add --text --name "your channel name" --id "your channel id"
```
#### Add voice channel
```ps
cn add --voice --name "your voice channel name" --id "your voice channel id"
```
#### Add forum channel
```ps
cn add --forum --name "your forum chanel name" --id "your forum channel id"
```
<br>
<br>
<br>

## Basics utilisations
### In any file initialized after the Discord_instance.js has a client global variable
```js
//in any file
const client = global.client
```
<br>
<br>
<br> 

### Send a message in a channel
Async method, returns an object in promise
```js
//in any file
await global.Channel.send('channename', 'content');
```
return discord.js [Messages:Class](https://discord.js.org/docs/packages/discord.js/14.14.1/Message:Class)
#### Other methods with directly Discord API
Async method, returns an object in promise
```js
//in any file
await global.client.sendMessageToChannel('channelname', 'content');
```
return discord.js [Messages:Class](https://discord.js.org/docs/packages/discord.js/14.14.1/Message:Class)

<br>
<br>

### Retrieve a member’s object from the Discord API
Async method, returns an object in promise
```js
//in any file
const member = await global.client.getUserByUsername('username');
```
return discord.js [GuildMember:Class](https://discord.js.org/docs/packages/discord.js/14.14.1/GuildMember:Class)

```js
//in any file
const member = await global.client.getMemberById('id');
```
return discord.js [GuildMember:Class](https://discord.js.org/docs/packages/discord.js/14.14.1/GuildMember:Class)

<br>
<br>

### Retrieve a channel's object from the Discord API
Async then method, returns an object
```js
//in any file
global.client.findChannelByName(channelname).then(channelObject => {
  //use a object
});
```
or async

Async method, returns an object in promise
```js
//in any file
const channel = await global.client.findChannelByName(channelname);
```
return discord.js [TextChannel:Class](https://discord.js.org/docs/packages/discord.js/main/TextChannel:Class)

### Check the status of a member with definitions
> You can check if a member has a particular role without worrying about the id of the role, as long as it is defined in " *types/global.t.ts* " in the GuidMember interface
>
> Also verify that you have defined the function in the prototypes " *src/common/Prototypes/Client.js* "
<br>

Returns an boolean
To use on the discord.js [GuildMember:Class](https://discord.js.org/docs/packages/discord.js/14.14.1/GuildMember:Class) object

```js
//in any file
member.client.isAdministrator();
```
<br>
<br>
<br>

## Extras
### Attachments
> It is possible to retrieve the attachments of messages during their sending and retrieve them later via the index

<br>

#### Capture and save attachments

To be used on the discord.js [Messages:Class](https://discord.js.org/docs/packages/discord.js/14.14.1/Message:Class) object

Async method, returns an object in promise
```js
//in any file
await global.attachment.handleAttachments(message);
```
returned object

```js
{
  {
    type: typeFile,
    channelId: message.channel.id,
    messageId: message.id,
    filename: uniqueId,
    originalFilename: originalFilename,
    url: filePath,
    userid: message.author.id,
    username: message.author.username
  }
}
```

<br>

#### Find attachments with the id of a message
Async method, returns an object in promise
```js
//in any file
await global.attachment.getAttachments(message.id);
```
returned object
```js
{
  {
    type: typeFile,
    channelId: message.channel.id,
    messageId: message.id,
    filename: uniqueId,
    originalFilename: originalFilename,
    url: filePath,
    userid: message.author.id,
    username: message.author.username
  }
}
```
<br>
<br>

### Logs recorded in a dated file 
> It is important to declare the resources needed at the beginning of the script in which you want to implement this feature

```js
//in any file
const filePath = 'path/of/your/file.js';
require('../../logutils') // for commands handlers

```
<br>

#### Implement one of these lines according to your needs
```js
//in any file
console.error(`${filePath} - Line ${__line} (${functionName}): Your information of the type of process :`, error);
```
```js
//in any file
console.info(`${filePath} - Line ${__line} (${functionName}): Your information of the type of process :`, info);
```
```js
//in any file
console.log(`${filePath} - Line ${__line} (${functionName}): Your information of the type of process :`, log);
```
<br>

> Find the logs in the " *src/common/logs* " folder, they are dated 








