/**
 * Router for manipulating team types
 */
const express = require('express');
const router = express.Router();
const {pool} = require('/js/serverJS/database/dbConfig.js');
const util = require("util");
/**
 * GET route for getting all team types
 */
router.post('/getteamtypes', function (req, res) {
    getTeamTypes().then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send({message: "There was an error getting the team type list! Please try again later."});
    });
});

/**
 * Get all team types
 * @returns {Promise<*>} a Promise that resolves to an array of team types
 */
function getTeamTypes() {
    return pool.query(`SELECT * FROM teamtype ORDER BY displayname`);
}

module.exports = router;