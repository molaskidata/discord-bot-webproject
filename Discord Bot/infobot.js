const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const express = require('express');

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

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({
        status: 'Bot is online!',
        name: BOT_INFO.name,
        version: BOT_INFO.version,
        uptime: process.uptime()
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`HTTP Server running on port ${PORT}`);
});

client.once('ready', () => {
    console.log(`${BOT_INFO.name} v${BOT_INFO.version} is online!`);
    console.log(`Logged in as ${client.user.tag}`);
    
    updateGameStatus();
    setInterval(updateGameStatus, 3600000); // Every hour
});

function updateGameStatus() {
    gameTimer++;
    if (gameTimer > MAX_HOURS) {
        gameTimer = 2;
    }
    
    client.user.setPresence({
        activities: [{
            name: 'Battlefield 6',
            type: ActivityType.Playing,
            details: `${gameTimer}h gespielt`,
            state: `Multiplayer Match`,
            applicationId: '1435244593301159978',
            assets: {
                large_image: 'battlefield',
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

module.exports = { client, BOT_INFO, app };