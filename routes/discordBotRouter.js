/**
 * Router for all endpoints that fetch or send data to the discord
 * @param client the discord client
 * @param guildId the GNX discord server id
 */
const {checkNotAuthenticated, permissionCheck} = require("../js/serverJS/sessionChecker");
const discordBot = require("../js/serverJS/discordBot");
module.exports = (client, guildId) => {
    const express = require('express');
    const router = express.Router();
    const discordBot = require('../js/serverJS/discordBot.js')
    const {permissionCheck, checkNotAuthenticated} = require("../js/serverJS/sessionChecker");

    /**
     * GET for how many Discord members are on our server
     */
    router.get('/discord-members', checkNotAuthenticated, permissionCheck('home', 'canOpen'), async (req, res) => {
        const members = await discordBot.getCurrentDiscordMembers();
        res.send({members: members});
    });

    /**
     * GET for checking the existence of a discord username on our server
     */
    router.get('/isDiscordNameValid', checkNotAuthenticated, permissionCheck('home', 'canOpen'), async (req, res) => {
        const discordUsername = req.query.username;

        const isValid = await discordBot.doesUserExist(discordUsername);
        res.status(200).send({ isValid: isValid, discordUsername: discordUsername });
    });


    return router;
}