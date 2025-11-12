const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const express = require('express');

// Bot configuration
const BOT_INFO = {
    name: "OnlineBot",
    version: "2.0.0",
    author: "mola",
    status: "24/7 Online"
};

// Create Express server for keep-alive
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({
        status: 'Bot is alive!',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.listen(PORT, () => {
    console.log(`Keep-alive server running on port ${PORT}`);
});

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Bot ready event
client.once('ready', () => {
    console.log(`${BOT_INFO.name} v${BOT_INFO.version} is online!`);
    console.log(`Logged in as ${client.user.tag}`);
    
    // Set bot activity
    client.user.setActivity('24/7 Online ☕', { type: ActivityType.Watching });
});

// Commands
client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    
    if (message.content === '!ping') {
        const ping = client.ws.ping;
        message.reply(`🏓 Pong! Latenz: ${ping}ms\n✅ Bot läuft 24/7`);
    }
    
    if (message.content === '!status') {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        
        message.reply(`📊 **Bot Status**\n🤖 ${BOT_INFO.name} v${BOT_INFO.version}\n⏱️ Online seit: ${hours}h ${minutes}m\n🟢 Status: ${BOT_INFO.status}`);
    }
});

// Auto-reconnect on disconnect
client.on('disconnect', () => {
    console.log('Bot disconnected! Attempting to reconnect...');
});

client.on('error', (error) => {
    console.error('Bot error:', error);
});

// Keep alive functions
setInterval(() => {
    console.log(`🟢 Bot alive: ${new Date().toISOString()}`);
}, 300000); // Every 5 minutes

// Self-ping to prevent sleeping (for free hosting)
setInterval(() => {
    if (process.env.NODE_ENV !== 'development') {
        require('http').get(`http://localhost:${PORT}`, (res) => {
            console.log('🔄 Self-ping successful');
        }).on('error', (err) => {
            console.log('❌ Self-ping failed:', err.message);
        });
    }
}, 280000); // Every 4 minutes 40 seconds

// Login
client.login(process.env.DISCORD_TOKEN);

module.exports = { client, BOT_INFO, app };
