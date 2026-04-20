const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
require("dotenv").config();
const express = require("express");
const Console = require("./ConsoleUtils");
const CryptoUtils = require("./CryptoUtils");
const SharedUtils = require("./SharedUtils");
const { BackendUtils, UserModel, UserController, RoundController, BattlePassController, EconomyController, AnalyticsController, FriendsController, NewsController, MissionsController, TournamentXController, MatchmakingController, TournamentController, SocialController, EventsController, authenticate, errorControll, sendShared, OnlineCheck, VerifyPhoton } = require("./BackendUtils");

const app = express();
const Title = "StumbleCrowns";
const PORT = process.env.PORT || 8080;

// 1. DISCORD BOT SETUP
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

mongoose.connect(process.env.mongoUri);

client.on('ready', () => {
    console.log(`✅ Bot is logged in as ${client.user.tag}`);
});

// 2. THE ADMIN / OP COMMAND
client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('!rename')) return;

    // Check if the Discord user has the "Admin" role
    const isAdmin = message.member.roles.cache.some(role => role.name === 'Admin');
    if (!isAdmin) return message.reply("❌ You are not an /op!");

    const [cmd, targetId, newName] = message.content.split(' ');
    if (!targetId || !newName) return message.reply("Usage: `!rename <ID> <NewName>`");

    try {
        await UserController.updateUsernameManual(targetId, newName);
        message.reply(`✅ /op Success! Player ${targetId} is now ${newName}`);
    } catch (err) {
        message.reply("⚠️ Database error.");
    }
});

// 3. SERVER ROUTES
app.use(express.json());
app.use(authenticate);

app.get('/', (req, res) => {
    res.send("Server is Online and Database Bot is Active!");
});

// ... (Rest of your existing game routes) ...
app.post("/photon/auth", VerifyPhoton);
app.post('/user/login', UserController.login);
// ... [Keep the rest of your routes here] ...

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

client.login(process.env.DISCORD_TOKEN);
