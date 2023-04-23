/**
 * Router for manipulating teams
 */
const express = require('express');
const router = express.Router();
const {pool} = require('/js/serverJS/database/dbConfig.js');
const util = require("util");

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
 * POST route for inserting a new team
 */
router.post('/insertteam', function (req, res) {
    const formData = req.body;

    insertTeam(formData).then((result) => {
        if (result === -1) {
            res.status(500).send({message: "There was an error inserting the team! Please try again later."});
        }else {
            res.status(200).send({message: "Team inserted successfully"});
        }
    }).catch(() => {
        res.status(500).send({message: "There was an error inserting the team! Please try again later."});
    });
});

/**
 * Get all teams
 * @returns {Promise<*>} a Promise that resolves to an array of teams
 */
function getTeams() {
    return pool.query(`SELECT * FROM team ORDER BY displayname`);
}

/**
 * Insert a new team
 * @param data the data of the team
 * @returns {Promise<number>} a Promise that resolves to the id of the new team
 */
function insertTeam(data) {
    results = pool.query(`INSERT INTO team (displayname, teamtype_fk, weight) VALUES ($1,$2,$3) RETURNING id`,[data.teamName, data.teamType, data.teamWeight]);

    if (results.rows.length === 0) {
        return -1;
    }else {
        return 0;
    }
}

module.exports = router;