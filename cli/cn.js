function createTrigger(triggerDefinition) {
    const match = triggerDefinition.match(/^(\w+)\(message\)$/);
    if (!match) {
        console.error('Invalid trigger function format. Expected format: functionName(message)');
        return;
    }

    const functionName = match[1];
    const triggersDir = path.join(__dirname, '../src/common/Triggers');
    const triggerFilePath = path.join(triggersDir, `${functionName}.js`);
    const typesFilePath = path.join(__dirname, '../types/global.t.ts');
    const messagesFilePath = path.join(__dirname, '../src/common/Events/Messages.js');
    const discordInstanceFilePath = path.join(__dirname, '../src/common/Discord_instance.js'); // Path vers Discord_instance.js

    console.log(`Creating trigger '${functionName}'...`);

    // Step 1: Create the trigger file
    if (!fs.existsSync(triggersDir)) {
        fs.mkdirSync(triggersDir, { recursive: true });
    }

    const triggerFileContent = `
global.triggers = global.triggers || {};

global.triggers.${functionName} = async function ${functionName}(message) {
    // Your trigger logic here
};

module.exports = {};
`;

    fs.writeFileSync(triggerFilePath, triggerFileContent, 'utf8');
    console.log(`Trigger file '${triggerFilePath}' created.`);

    // Step 2: Update types/global.t.ts
    let typesContent = fs.readFileSync(typesFilePath, 'utf8');
    const typeMarker04 = '//CLIMarker#04';
    const typeMarker05 = '//CLIMarker#05';

    if (typesContent.includes(`${functionName}: (message: any) => Promise<void>;`)) {
        console.log(`Trigger type '${functionName}' already exists in global.t.ts.`);
    } else {
        typesContent = typesContent.replace(
            typeMarker04,
            `${typeMarker04}\n    ${functionName}: (message: any) => Promise<void>;`
        );
        typesContent = typesContent.replace(
            typeMarker05,
            `${typeMarker05}\n    ${functionName}: (message: any) => Promise<void>;`
        );
        fs.writeFileSync(typesFilePath, typesContent, 'utf8');
        console.log(`Trigger type '${functionName}' added to global.t.ts.`);
    }

    // Step 3: Update src/common/Events/Messages.js
    let messagesContent = fs.readFileSync(messagesFilePath, 'utf8');
    const messageMarker = '//CLIMarker#06';

    if (!messagesContent.includes(`await global.triggers.${functionName}(message);`)) {
        messagesContent = messagesContent.replace(
            messageMarker,
            `${messageMarker}\n    await global.triggers.${functionName}(message);`
        );
        fs.writeFileSync(messagesFilePath, messagesContent, 'utf8');
        console.log(`Trigger call '${functionName}' added to Messages.js.`);
    } else {
        console.log(`Trigger call '${functionName}' already exists in Messages.js.`);
    }

    // Step 4: Update src/common/Discord_instance.js
    let discordInstanceContent = fs.readFileSync(discordInstanceFilePath, 'utf8');
    const discordMarker = '//CLIMarker#07';

    if (!discordInstanceContent.includes(`require('./Triggers/${functionName}');`)) {
        discordInstanceContent = discordInstanceContent.replace(
            discordMarker,
            `${discordMarker}\nrequire('./Triggers/${functionName}');`
        );
        fs.writeFileSync(discordInstanceFilePath, discordInstanceContent, 'utf8');
        console.log(`Trigger '${functionName}' added to Discord_instance.js.`);
    } else {
        console.log(`Trigger '${functionName}' already exists in Discord_instance.js.`);
    }
}
