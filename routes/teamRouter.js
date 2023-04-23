/**
 * Router for manipulating teams
 */
const express = require('express');
const router = express.Router();
const {pool} = require('/js/serverJS/database/dbConfig.js');

/**
 * GET route for getting all teams
 */
router.post('/getteams', function (req, res) {
    getTeams().then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send({message: "There was an error getting the team list! Please try again later."});
    });
});

/**
 * Get all teams
 * @returns {Promise<*>} a Promise that resolves to an array of teams
 */
function getTeams() {
    return pool.query(`SELECT * FROM team ORDER BY displayname`);
}

module.exports = router;