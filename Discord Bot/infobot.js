const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const BOT_INFO = {
    name: "InfoBot",
    version: "1.0.0",
    publicKey: "c754a88258af8d04269c334d31632c463f6c74cceb320f6c27c404a41dc5d4a1",
    author: "mola"
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let gameTimer = 0;
const MAX_HOURS = 20;

client.once('ready', () => {
    console.log(`${BOT_INFO.name} v${BOT_INFO.version} is online!`);
    console.log(`Logged in as ${client.user.tag}`);
    
    updateGameStatus();
    setInterval(updateGameStatus, 3600000); // Every hour
});

function updateGameStatus() {
    gameTimer++;
    if (gameTimer > MAX_HOURS) {
        gameTimer = 1;
    }
    
    client.user.setPresence({
        activities: [{
            name: `Battlefield 6`,
            type: ActivityType.Playing,
            details: `${gameTimer}h gespielt`,
            state: `Online seit ${gameTimer} Stunden`,
            assets: {
                large_image: 'https://i.imgur.com/V9U57EN.png',
                large_text: 'Battlefield 6'
            },
            timestamps: {
                start: Date.now() - (gameTimer * 3600000)
            }
        }],
        status: 'online'
    });
}

client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    
    if (message.content === '!ping') {
        message.reply('Pong! Bot is running 24/7');
    }
    
    if (message.content === '!info') {
        message.reply(`Bot: ${BOT_INFO.name} v${BOT_INFO.version}\nStatus: Online 24/7`);
    }
});

client.login(process.env.DISCORD_TOKEN);

setInterval(() => {
    console.log(`Bot alive: ${new Date().toISOString()}`);
    process.stdout.write('\x1b[0G');
}, 60000);

setInterval(() => {
    console.log(`Bot alive at: ${new Date().toISOString()}`);
}, 300000);

module.exports = { client, BOT_INFO };