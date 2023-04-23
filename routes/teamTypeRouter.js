/**
 * Router for manipulating team types
 */
const express = require('express');
const router = express.Router();
const {pool} = require('/js/serverJS/database/dbConfig.js');

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
 * POST route for inserting a new team type
 */
router.post('/insertteamtype', function (req, res) {
    const formData = req.body;

    insertTeamType(formData).then((result) => {
        if (result === -1) {
            res.status(500).send({message: "There was an error inserting the team type! Please try again later."});
        }else {
            res.status(200).send({message: "Team type inserted successfully"});
        }
    }).catch(() => {
        res.status(500).send({message: "There was an error inserting the team type! Please try again later."});
    });
});


/**
 * Get all team types
 * @returns {Promise<*>} a Promise that resolves to an array of team types
 */
function getTeamTypes() {
    return pool.query(`SELECT * FROM teamtype ORDER BY displayname`);
}

/**
 * Insert a new team type
 * @param data the data of the team type
 * @returns {Promise<number>} a Promise that resolves to the id of the new team type
 */
async function insertTeamType(data) {
    results = pool.query(`INSERT INTO teamtype (name, displayname) VALUES ($1,$2) RETURNING id`,[data.internalName, data.displayName]);

    if (results.rowCount === 0) {
        return -1;
    }else {
        return 0;
    }
}

module.exports = router;