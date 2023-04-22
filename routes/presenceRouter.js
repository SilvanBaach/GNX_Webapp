/**
 * Router for all manipulation of presence data
 */
const express = require('express');
const router = express.Router();
const {pool} = require('../js/serverJS/database/dbConfig.js');

/**
 * GET route for getting the presence data of a team
 */
router.get('/getPresenceListFromTeam/:teamId/:epochFrom/:epochUntil', function (req, res) {
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
 * Get the presence data of a team
 * @param teamId the id of the team
 * @param from start of the time period
 * @param until end of the time period
 * @returns {Promise<*>}
 */
async function getPresenceFromTeam(teamId, from, until) {
    return pool.query(`SELECT presence.*, account.username
                       FROM presence
                                LEFT JOIN account ON account.id = presence.account_fk
                       WHERE account.id IN (SELECT account_fk FROM teammembership WHERE team_fk = $1)
                         AND presence.date >= $2
                         AND presence.date <= $3`, [teamId, from, until]);
}

module.exports = router;