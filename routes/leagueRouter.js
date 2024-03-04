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
router.get('/getMatchHistory', checkNotAuthenticated, permissionCheck('lolstatspage', 'canOpen'), async function (req, res) {
    const riotName = 'Sh0jin'; //TODO
    const riotTag = 'bird'; //TODO
    let latestDate = new Date();
    latestDate.setDate(latestDate.getDate() - 100);

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://www.op.gg/summoners/euw/${riotName}-${riotTag}`);

    let dataParts = [];
    let isOlder = false;
    let responseCount = 0;

    // Set up a response listener for the specific API endpoint
    page.on('response', async (response) => {
        if (response.url().startsWith('https://op.gg/api/v1.0/internal/bypass/games/euw/summoners/')) {
            const json = await response.json();
            dataParts.push(...json.data); // Flatten the data structure
            responseCount++;

            // Check if the latest game is older than the latestDate
            const createdAt = new Date(json.data[json.data.length - 1].created_at);
            if (createdAt < latestDate) {
                isOlder = true;
            }

            if (isOlder || responseCount > 10) {
                await browser.close();

                // Filter out games newer than latestDate
                let filteredData = dataParts.filter(game => {
                    const gameDate = new Date(game.created_at);
                    return gameDate < latestDate;
                });

                res.status(200).send(filteredData);
            } else {
                // Check if the "Show More" button is available
                const loadMoreButton = await page.$('button.more');
                if (loadMoreButton) {
                    await loadMoreButton.click();
                } else {
                    // No more "Show More" button, so no more games to load
                    console.log(dataParts)
                    await browser.close();

                    res.status(200).send(dataParts);
                }
            }
        }
    });

    // Click the "Solo/Duo Ranked" button
    try {
        const selector = 'button[value="SOLORANKED"]';
        await page.waitForSelector(selector, { visible: true });
        await page.click(selector);
    } catch {
        console.log('Solo/Duo Ranked button not found');
    }
});

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
 * GET route for getting the lolstats page definition of a user
 */
router.get('/getLolstatsDefinition',  checkNotAuthenticated, permissionCheck('lolstatspage', 'canOpen'), function (req, res) {
    getLolStatsConfig(req.user).then((result) => {
        res.status(200).send(result.rows[0]);
    }).catch((err) => {
        console.log(err);
        res.status(500).send({message: "There was an error getting the lolstats config."});
    });
});

/**
 * POST route for adding a new user to the lolstats definition
 */
router.post('/addPlayerToLolstatsDefinition',  checkNotAuthenticated, permissionCheck('lolstatspage', 'canOpen'), function (req, res) {
    const riotId = req.body.riotId;
    const order = req.body.order;

    appendUserToLolstatsDefinition(req.user.id, riotId, order).then((result) => {
        logMessage(`User ${req.user.username} added an Account to his Lolstats Page definition`,LogLevel.INFO,req.user.id);
        res.status(200).send({message: "User added successfully"});
    }).catch((err) => {
        console.log(err);
        res.status(500).send({message: "There was an error updating the lolstats config."});
    });
});

/**
 * POST route for removing a user from the lolstats defintion
 */
router.post('/removePlayerFromLolstatsDefinition',  checkNotAuthenticated, permissionCheck('lolstatspage', 'canOpen'), function (req, res) {
    const riotId = req.body.riotId;
    const order = req.body.order;

    removeUserFromLolstatsDefinition(req.user.id, riotId, order).then((result) => {
        logMessage(`User ${req.user.username} removed an Account to his Lolstats Page definition`,LogLevel.INFO,req.user.id);
        res.status(200).send({message: "User removed successfully"});
    }).catch((err) => {
        console.log(err);
        res.status(500).send({message: "There was an error updating the lolstats config."});
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
 * Returns the lolstats config of a user
 * If there is no config, it will insert a new one
 * @param user
 */
function getLolStatsConfig(user) {
    return pool.query(`SELECT * FROM lolstatsdefinition WHERE account_fk=$1`,[user.id])
        .then(result => {
            if (result.rows.length === 0) {
                let pagesetup = '[{"order": 1, "riotid": "' + user.riotgames + '"}]';
                return pool.query(`INSERT INTO lolstatsdefinition (account_fk, pagesetup) VALUES ($1, $2) RETURNING *`, [user.id, pagesetup]);
            }
            return result;
        });
}

/**
 * This function appends a new account to the lol stats definition
 * @param userId
 * @param riotId
 * @param order
 * @returns {Promise<QueryResult<any>>}
 */
async function appendUserToLolstatsDefinition(userId, riotId, order) {
    const result = await pool.query(`SELECT pagesetup FROM lolstatsdefinition WHERE account_fk=$1`, [userId]);
    let pagesetupArray = result.rows[0].pagesetup;
    pagesetupArray.push({ order, riotid: riotId });
    pagesetupArray.sort((a, b) => a.order - b.order); // Ensure the array is sorted by order
    return await pool.query(`UPDATE lolstatsdefinition SET pagesetup=$1 WHERE account_fk=$2`, [JSON.stringify(pagesetupArray), userId]);
}

/**
 * This function removes a user from the lol stats definition
 * @param userId
 * @param riotId
 * @param order
 * @returns {Promise<QueryResult<any>>}
 */
async function removeUserFromLolstatsDefinition(userId, riotId, order) {
    const result = await pool.query(`SELECT pagesetup FROM lolstatsdefinition WHERE account_fk=$1`, [userId]);
    let pagesetupArray = result.rows[0].pagesetup;
    pagesetupArray = pagesetupArray.filter(item => !(item.riotid === riotId && item.order === order));
    return await pool.query(`UPDATE lolstatsdefinition SET pagesetup=$1 WHERE account_fk=$2`, [JSON.stringify(pagesetupArray), userId]);
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