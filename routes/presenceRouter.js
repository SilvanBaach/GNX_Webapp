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
    return pool.query(`WITH times AS (SELECT CAST(EXTRACT(epoch FROM day AT TIME ZONE 'CEST') AS INTEGER) AS time_series,
                        to_char(to_timestamp(EXTRACT(epoch FROM day AT TIME ZONE 'CEST')), 'DD.MM.YYYY') AS readable_date 
                        FROM generate_series(current_date, current_date + interval '40 days', '1 day') AS day),
                        
                        --Get the presence data of the team
                        --Remove all rows where the state is 2 (absent) and date < today
                        tmpData AS (
                            SELECT times.time_series, readable_date, account.username, presence.state, CASE WHEN presence.from IS NULL OR presence.from = '' THEN '00:00' ELSE presence.from END AS from, 
                            CASE WHEN presence.until IS NULL OR presence.until = '' THEN '23:59' ELSE presence.until END AS until FROM account 
                            LEFT JOIN teammembership ON teammembership.account_fk = account.id CROSS JOIN times 
                            LEFT JOIN presence ON presence.account_fk = account.id AND presence.date = times.time_series AND presence.state <> 2 
                            WHERE teammembership.team_fk = $1 AND presence.date > EXTRACT(epoch FROM (CURRENT_DATE - INTERVAL '1 day' + INTERVAL '23 hours 59 minutes')::timestamp AT TIME ZONE 'CEST') ORDER BY time_series),
                        
                        --Count the number of rows for each time_series
                        counts AS (
                            SELECT time_series, COUNT(*) AS num_rows FROM tmpData GROUP BY time_series),
                        
                        --Remove all rows where the number of rows is not equal to the number of team members 
                        tmpData2 AS(
                            SELECT tmpData.* FROM tmpData JOIN counts ON tmpData.time_series = counts.time_series
                            WHERE num_rows = (  SELECT COUNT(*) FROM account LEFT JOIN teammembership ON teammembership.account_fk = account.id 
                                                WHERE teammembership.team_fk=$1) ORDER BY tmpData.time_series),
                                                
                        --Add the starttime and endtime for each time_series                     
                        tmpData3 AS (
                            SELECT *, (SELECT MAX(x.from) FROM tmpData2 AS x WHERE x.time_series = tmpData2.time_series) AS starttime,
                            (SELECT MIN(x.until) FROM tmpData2 AS x WHERE x.time_series = tmpData2.time_series) AS endtime FROM tmpData2),
                            
                        --Add the trainingtype (sure or unsure) for each time_series
                        tmpData4 AS (
                            SELECT *, CASE WHEN (SELECT COUNT(*) FROM tmpData3 AS x WHERE x.time_series = tmpData3.time_series AND x.state = 3) > 0 
                            THEN 'unsure' ELSE 'sure'  END AS trainingtype FROM tmpData3 WHERE starttime < endtime)
                        
                        --Group the data by readable_date, starttime, endtime and trainingtype
                       SELECT
                           CASE
                               WHEN TO_DATE(readable_date, 'dd.mm.yyyy') = CURRENT_DATE THEN 'Today'
                               WHEN TO_DATE(readable_date, 'dd.mm.yyyy') = CURRENT_DATE + INTERVAL '1 day' THEN 'Tomorrow'
                               ELSE readable_date
                               END AS readable_date,
                           starttime, endtime, trainingtype,
                           CONCAT(EXTRACT(HOUR FROM (endtime::TIME - starttime::TIME)), ':', LPAD(EXTRACT(MINUTE FROM (endtime::TIME - starttime::TIME))::TEXT, 2, '0'),' h') AS duration FROM tmpData4
                       GROUP BY readable_date,  starttime, endtime, trainingtype
                       ORDER BY  TO_DATE(readable_date, 'dd.mm.yyyy');`, [teamId]);
}

module.exports = router;