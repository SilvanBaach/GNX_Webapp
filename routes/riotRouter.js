const express = require('express');
const router = express.Router();
const riot = require('../js/serverJS/riot.js')
const {checkNotAuthenticated, permissionCheck} = require("../js/serverJS/sessionChecker");
const {pool} = require("../js/serverJS/database/dbConfig");
const {logMessage, LogLevel} = require('../js/serverJS/logger.js');
const axios = require('axios');
const {getAccountInfo, getSummonerInfo, getSummonerIcon} = require("../js/serverJS/riot");
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * GET DDragon Data from project
 */
router.get('/getDDragonData', permissionCheck('championpool', 'canOpen'), async (req, res) => {
    const championData = await riot.getDDragonDataFromProject();
    res.send(championData);
});


/**
 * GET lol player icon
 */
router.get('/getPlayerIcon', permissionCheck('lolstatspage', 'canOpen'), async (req, res) => {
    getAccountInfo(req.query.riotId).then((accountInfo) => {
        getSummonerInfo(accountInfo.data.puuid).then((summonerInfo) => {
           res.status(200).send({icon: `https://ddragon.leagueoflegends.com/cdn/14.4.1/img/profileicon/${summonerInfo.summonerInfo.profileIconId}.png`});
        });
    }).catch((error) => {
        console.log(error);
        res.status(500).send({message: "There was an error fetching the player icon"});
    });
});

/**
 * GET Request to get the summoner name, playerid, puuid etc
 */
router.get('/getSummonerInfo', permissionCheck('lolstatspage', 'canOpen'), async (req, res) => {
    getAccountInfo(req.query.riotId).then((accountInfo) => {
        getSummonerInfo(accountInfo.data.puuid).then((summonerInfo) => {
            res.status(200).send({summonerInfo: summonerInfo});
        });
    }).catch((error) => {
        console.log(error);
        res.status(500).send({message: "There was an error fetching the player name"});
    });
});

/**
 * GET route to check if a riot id is valid
 */
router.get('/isRiotIdValid', permissionCheck('home', 'canOpen'), async (req, res) => {
    getAccountInfo(req.query.riotId).then((result) => {
        res.status(200).send(result);
    }).catch(() => {
        res.status(500).send({message: "There was an error checking the Riot ID"});
    });
});

/**
 * GET route for getting the match history
 */
router.get('/getMatchHistory', checkNotAuthenticated, permissionCheck('championpool', 'canOpen'), async function (req, res) {
    const riotName = 'Sh0jin'; //TODO
    const riotTag = 'bird' //TODO
    let latestDate = new Date();
    latestDate.setDate(latestDate.getDate() - 14); //TODO

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(`https://www.op.gg/summoners/euw/${riotName}-${riotTag}`, { waitUntil: 'networkidle0' });

    // Set up a response listener for the specific API endpoint
    page.on('response', async (response) => {
        // Check if the response URL is the one from the "Load More" action
        if (response.url().startsWith('https://op.gg/api/v1.0/internal/bypass/games/euw/summoners/')) {
            const data = await response.json(); // Assuming the response is JSON
            // ... do something with the data, such as saving it to a file
            const filePath = path.join(require('os').homedir(), 'Desktop', 'gamesData.json');
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        }
    });

    // Click the "Show More" button
    const selector = 'button.more';
    await page.waitForSelector(selector, { visible: true }); // Ensure the button is loaded
    await page.click(selector);

    // Wait for the selector that indicates new content is loaded. You need to identify what changes in the page.
    //await page.waitForSelector('selector-of-new-content', { visible: true });
    await waitForTimeout(10000); // Wait for 5 seconds (just an example, you can use any other method to wait for the new content to load)

    // Retrieve the content of the webpage after the new content is loaded
    const content = await page.content();

    await browser.close();

    let startIndex = content.indexOf('<script id="__NEXT_DATA__" type="application/json">') + '<script id="__NEXT_DATA__" type="application/json">'.length;
    let endIndex = content.indexOf('</script>', startIndex);
    let jsonStr = content.substring(startIndex, endIndex);

    // Remove everything before the JSON data
    const jsonData = jsonStr.slice(jsonStr.indexOf('{'), jsonStr.lastIndexOf('}') + 1);
    const filePath = path.join(require('os').homedir(), 'Desktop', 'content.json');
    fs.writeFileSync(filePath, content, 'utf8');
    // Return the HTML content to the client
    res.status(200).send({message: "Success", data: JSON.parse(jsonData).props.pageProps.games});
});

function waitForTimeout(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

/**
 * GET route for getting the championpool data
 */
router.get('/getChampionpool/:teamId',  checkNotAuthenticated, permissionCheck('championpool', 'canOpen'), function (req, res) {
    getChampionpool(req.params.teamId).then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send({message: "There was an error getting the championpool data."});
    });
});

/**
 * POST route for changing the champion order
 */
router.post('/changeChampionOrder/:id/:direction', checkNotAuthenticated, permissionCheck('championpool', 'canOpen'), function (req, res) {
    const championpoolId = req.params.id;
    const direction = req.params.direction;

    changeChampionOrder(championpoolId, req.user.team.id,direction).then((result) => {
        res.status(200).send({message: "Order updated successfully"});
        logMessage(`User ${req.user.username} changed the order of the championpool`,LogLevel.INFO,req.user.id);
    }).catch(() => {
        res.status(500).send({message: "There was an error updating the order! Please try again later."});
    });
});

/**
 * POST route for deleting a champion from the championpool
 */
router.post('/deleteChampion/:id', checkNotAuthenticated, permissionCheck('championpool', 'canOpen'), function (req, res) {
    const championpoolId = req.params.id;

    deleteChampion(championpoolId).then((result) => {
        res.status(200).send({message: "Champion deleted successfully"});
        logMessage(`User ${req.user.username} deleted a champion from the championpool`,LogLevel.INFO,req.user.id);
    }).catch(() => {
        res.status(500).send({message: "There was an error deleting the champion! Please try again later."});
    })
});

/**
 * POST route adding a champion to the championpool
 */
router.post('/addChampion', checkNotAuthenticated, permissionCheck('championpool', 'canOpen'), function (req, res) {
    const champion = req.body.champion;
    const lane = req.body.lane;
    const type = req.body.type;

    addChampion(champion, lane, req.user.id, req.user.team.id, type).then((result) => {
        res.status(200).send({message: "Champion added successfully"});
        logMessage(`User ${req.user.username} added the champion ${champion} to the championpool`,LogLevel.INFO,req.user.id);
    }).catch(() => {
        res.status(500).send({message: "There was an error adding the champion! Please try again later."});
    })
});

/**
 * Inserts a champion into the championpool
 * @param champion
 * @param lane
 * @param userId
 * @param teamId
 * @returns {Promise<QueryResult<any>>}
 */
function addChampion(champion, lane, userId, teamId, type) {
    return pool.query(`INSERT INTO championpool (champion, lane, team_fk, "order", account_fk2, type) VALUES ($1, $2, $3, (SELECT COUNT(*) FROM championpool WHERE lane=$2 AND team_fk=$3 AND type=$5)+1, $4, $5)`, [champion, lane, teamId, userId, type]);
}

/**
 * Returns all championpool data from the database of one team
 * @param teamId
 * @returns {Promise<QueryResult<any>>}
 */
function getChampionpool(teamId) {
    return pool.query(`SELECT * FROM championpool WHERE team_fk=$1 ORDER BY id`,[teamId]);
}

/**
 * Changes the order of the championpool
 * @param championpoolId
 * @param teamId
 * @param direction 0=up 1=down
 * @returns {Promise<QueryResult<any>>}
 */
function changeChampionOrder(championpoolId, teamId, direction) {

    let updateOrderQuery;
    if (direction === "0") {
         updateOrderQuery = `
            WITH updated AS (
                UPDATE championpool
                    SET "order" = "order" - 1
                    WHERE id = $1
                    RETURNING "lane", "type", "order")
            UPDATE championpool
            SET "order" = "order" + 1
            WHERE "lane" = (SELECT "lane" FROM updated)
              AND "type" = (SELECT "type" FROM updated)
              AND "team_fk" = $2
              AND "order" = (SELECT "order" FROM updated)
              AND id != $1;
        `;
    } else {
        updateOrderQuery = `
            WITH updated AS (
                UPDATE championpool
                    SET "order" = "order" + 1
                    WHERE id = $1
                    RETURNING "lane", "type", "order")
            UPDATE championpool
            SET "order" = "order" - 1
            WHERE "lane" = (SELECT "lane" FROM updated)
              AND "type" = (SELECT "type" FROM updated)
              AND "team_fk" = $2
              AND "order" = (SELECT "order" FROM updated)
              AND id != $1;
        `;
    }
    return pool.query(updateOrderQuery, [championpoolId, teamId]);
}

/**
 * Deletes a champion from the championpool and orders the rest of them again
 * @param championpoolId
 * @returns {Promise<QueryResult<any>>}
 */
function deleteChampion(championpoolId) {
    return pool.query(`
        WITH deleted AS (
            DELETE FROM championpool WHERE id = $1 RETURNING "lane", "type", "team_fk", "order"
        )
        UPDATE championpool
        SET "order" = "order" - 1
        WHERE "lane" = (SELECT "lane" FROM deleted)
          AND "type" = (SELECT "type" FROM deleted)
          AND "team_fk" = (SELECT "team_fk" FROM deleted)
          AND "order" > (SELECT "order" FROM deleted);
    `, [championpoolId]);
}

module.exports = router;