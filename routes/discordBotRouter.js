/**
 * Router for all endpoints that fetch or send data to the discord
 * @param client the discord client
 * @param guildId the GNX discord server id
 */
module.exports = (client, guildId) => {
    const express = require('express');
    const router = express.Router();
    const discordBot = require('../js/serverJS/discordBot.js')

    /**
     * GET for how many Discord members are on our server
     */
    router.get('/discord-members', async (req, res) => {
        const members = discordBot.getCurrentDiscordMembers(guildId, client);
        res.send({onlineMembers: members});
    });

    return router;
}