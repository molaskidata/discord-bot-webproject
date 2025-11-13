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

// Robust HTTP Server für Render
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health Check Endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'Bot Online',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        bot: BOT_INFO
    });
});

// Keep-Alive Endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Bot Status Endpoint
app.get('/status', (req, res) => {
    res.status(200).json({
        logged_in: client.readyAt !== null,
        ping: client.ws.ping,
        guilds: client.guilds.cache.size,
        users: client.users.cache.size
    });
});

// Game Status Endpoint
app.get('/game-status', (req, res) => {
    gameTimer++;
    if (gameTimer > MAX_HOURS) {
        gameTimer = 2;
    }
    
    res.status(200).json({
        gameTimer,
        gameStatus: `Multiplayer Match`,
        applicationId: '1435244593301159978',
        assets: {
            large_image: 'battlefield',
            large_text: 'Battlefield 6'
        },
        timestamps: {
            start: Date.now() - (gameTimer * 3600000)
        }
    });
});

// Self-Ping um Render wach zu halten
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

setInterval(async () => {
    try {
        const response = await fetch(`${RENDER_URL}/health`);
        console.log(`🔄 Self-ping: ${response.status} - Bot stays awake`);
    } catch (error) {
        console.log('❌ Self-ping failed:', error.message);
    }
}, 840000); // Every 14 minutes (vor dem 15min timeout)

// Server starten und Port binden
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ HTTP Server running on port ${PORT}`);
    console.log(`✅ Server bound to 0.0.0.0:${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
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

const PREFIX = '?';

const hiResponses = [
    "Heyho, how ya doing? ☕",
    "Hi! You coding right now? 💻", 
    "Hey, how is life going? 😊",
    "Hi creature, what's life on earth doing? 🌍"
];

client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    
    if (message.content === '!ping') {
        message.reply('Pong! Bot is running 24/7');
    }
    
    if (message.content === '!info') {
        message.reply(`Bot: ${BOT_INFO.name} v${BOT_INFO.version}\nStatus: Online 24/7`);
    }
    
    if (message.content.startsWith(PREFIX)) {
        const command = message.content.slice(PREFIX.length).toLowerCase();
        
        switch(command) {
            case 'hi':
                message.reply(getRandomResponse(hiResponses));
                break;
            case 'coffee':
                message.reply(getRandomResponse(coffeeResponses));
                break;
            case 'meme':
                message.reply(getRandomResponse(programmingMemes));
                break;
            case 'motivation':
                message.reply(getRandomResponse(motivationQuotes));
                break;
            case 'goodnight':
                message.reply(getRandomResponse(goodnightResponses));
                break;
        }
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