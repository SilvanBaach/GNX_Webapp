const express = require('express');
const router = express.Router();
const riot = require('../js/serverJS/riot.js')
const {checkNotAuthenticated, permissionCheck} = require("../js/serverJS/sessionChecker");
const {pool} = require("../js/serverJS/database/dbConfig");
const {logMessage, LogLevel} = require('../js/serverJS/logger.js');
const {getAccountInfo, getSummonerInfo, getSummonerIcon} = require("../js/serverJS/riot");
const puppeteer = require('puppeteer');


/**
 * GET route for getting the match history
 */
router.get('/getMatchHistory', checkNotAuthenticated, permissionCheck('home', 'canOpen'), async function (req, res) {
    const riotName = req.query.name;
    const riotTag = req.query.tag;
    let latestDate = new Date();
    latestDate.setDate(latestDate.getDate() - req.query.days);
    const url = `https://api.tracker.gg/api/v1/valorant/matches/riot/${riotName}%23${riotTag}/aggregated?localOffset=-60&playlist=competitive&seasonId=`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const text = await response.text();

        // Check if the response is not empty
        if (text.trim() === '') {
            throw new Error('Empty response received from the API');
        }

        const jsonData = JSON.parse(text);
        console.dir(jsonData, { depth: null });
        res.status(200).send(jsonData)
    } catch (error) {
        console.error('Error occurred while fetching match history:', error);
        res.status(500).json({ error: 'An error occurred while fetching match history' });
    }
});


module.exports = router;
