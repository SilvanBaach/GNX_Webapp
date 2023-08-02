/**
 * Router for all endpoints that fetch or send data to the discord
 * @param client the discord client
 * @param guildId the GNX discord server id
 */
module.exports = (client, guildId) => {
    const express = require('express');
    const router = express.Router();
    const discordBot = require('../js/serverJS/discordBot.js')
    const {permissionCheck, checkNotAuthenticated} = require("../js/serverJS/sessionChecker");

    /**
     * GET for how many Discord members are on our server
     */
    router.get('/discord-members', checkNotAuthenticated, permissionCheck('home', 'canOpen'), async (req, res) => {
        const members = await discordBot.getCurrentDiscordMembers(guildId, client);
        res.send({members: members});
    });

    return router;
}