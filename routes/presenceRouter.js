/**
 * Router for all manipulation of presence data
 */
const express = require('express');
const router = express.Router();
const {pool} = require('../js/serverJS/database/dbConfig.js');
const util = require("util");
const { checkNotAuthenticated, permissionCheck } = require('../js/serverJS/sessionChecker.js'); //If not logged in to Index
const {logMessage, LogLevel} = require('../js/serverJS/logger.js');

/**
 * GET route for getting the presence data of a team
 */
router.get('/getPresenceListFromTeam/:teamId/:epochFrom/:epochUntil', checkNotAuthenticated, permissionCheck('calendar', 'canOpen'), function (req, res) {
    const teamId = req.params.teamId;
    const from = req.params.epochFrom;
    const until = req.params.epochUntil;

    getPresenceFromTeam(teamId, from, until).then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send("There was an error getting the presence data! Please try again later.");
    });
});

/**
 * POST route for saving the presence data of a user
 */
//TODO: Check if the user is allowed to save the presence data
router.post('/save', checkNotAuthenticated, function (req, res) {
    const data = req.body;
    savePresence(data).then(() => {
        logMessage(`User ${req.user.username} saved a presence`,LogLevel.INFO,req.user.id);
        res.status(200).send('Presence data saved successfully!');
    }).catch(() => {
        res.status(500).send("There was an error saving the presence data! Please try again later.");
    });
});

/**
 * GET route for getting the next trainings of a team
 */
router.get('/nextTrainings/:teamId', checkNotAuthenticated, permissionCheck('calendar', 'canOpen'), function (req, res) {
    const teamId = req.params.teamId;

    getNextTrainings(teamId).then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send("There was an error getting the next trainings! Please try again later.");
    });
});


/**
 * Get the presence data of a team
 * @param teamId the id of the team
 * @param from start of the time period
 * @param until end of the time period
 * @returns {Promise<*>}
 */
function getPresenceFromTeam(teamId, from, until) {
    return pool.query(`SELECT presence.*, account.username
                       FROM presence
                                LEFT JOIN account ON account.id = presence.account_fk
                       WHERE account.id IN (SELECT account_fk FROM teammembership WHERE team_fk = $1)
                         AND presence.date >= $2
                         AND presence.date <= $3`, [teamId, from, until]);
}

/**
 * Saves the presence data of a user
 * If the presence is already saved, it will be updated
 * @param data the presence data
 * @returns {Promise<number>}
 */
async function savePresence(data) {
    const username = data.username;
    const parts = data.date.split('.');
    const day = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const dateDat = new Date(year, monthIndex, day);
    dateDat.setHours(0, 0, 0, 0);
    const date = Math.floor(dateDat.getTime() / 1000)

    //Check if the presence is already saved
    const query = util.promisify(pool.query).bind(pool);
    const results = await query(`SELECT * FROM presence LEFT JOIN account ON account.id = presence.account_fk WHERE account.username = $1 AND date = $2`, [username, date]);

    if (results.rowCount === 0) {
        //Insert the presence
        return pool.query(`INSERT INTO presence (account_fk, date, state, comment, "from", until) VALUES ((SELECT id FROM account WHERE username = $1),$2,$3,$4,$5,$6)`, [username, date, data.state, data.comment, data.from, data.until]);
    } else {
        //Update the presence
        return pool.query(`UPDATE presence SET state = $3, comment = $4, "from" = $5, until = $6 WHERE account_fk = (SELECT id FROM account WHERE username = $1) AND date = $2`, [username, date, data.state, data.comment, data.from, data.until]);
    }
}

/**
 * Get the next trainings of a team
 * @param teamId the id of the team
 */
function getNextTrainings(teamId) {
    //Generate epoch and readable date for the next 14 days
    return pool.query(`SELECT readable_date, starttime, endtime, CASE WHEN playercount<0 THEN 'fixed' ELSE 'proposed' END AS trainingtype,
                                        CONCAT(EXTRACT(HOUR FROM (endtime::TIME - starttime::TIME)), ':', LPAD(EXTRACT(MINUTE FROM (endtime::TIME - starttime::TIME))::TEXT, 2, '0'),' h') AS duration
                                        FROM tranings
                                        WHERE team_fk = $1 AND (traningtype = 'fixed' OR playercount = totalplayers)
                                        AND epochdate >= (EXTRACT(EPOCH FROM NOW())::BIGINT - 86399)`, [teamId]);
}

module.exports = router;