const express = require('express');
const router = express.Router();
const riot = require('../js/serverJS/riot.js')
const {checkNotAuthenticated} = require("../js/serverJS/sessionChecker");
const {pool} = require("../js/serverJS/database/dbConfig");


/**
 * GET DDragon Data from project
 */
router.get('/getDDragonData', async (req, res) => {
    const championData = await riot.getDDragonDataFromProject();
    res.send(championData);
});

/**
 * GET route for getting the championpool data
 */
router.get('/getChampionpool',  checkNotAuthenticated, function (req, res) {
    getChampionpool().then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send({message: "There was an error getting the championpool data."});
    });
});

/**
 * POST route for updating a team
 */
router.post('/updateChampionpool', checkNotAuthenticated, function (req, res) {
    const formData = req.body;

    updateOrInsertChampionpool(formData).then((result) => {
        if (result.rowCount === 0) {
            res.status(500).send({message: "There was an error updating the championpool! Please try again later."});
        }else {
            res.status(200).send({message: "Championpool updated successfully"});
        }
    }).catch(() => {
        res.status(500).send({message: "There was an error updating the championpool! Please try again later."});
    });
});

function getChampionpool() {
    return pool.query(`SELECT * FROM championpool ORDER BY id`);
}

function updateOrInsertChampionpool(data) {
    let promises = [];
    const array = data.championpoolData;
    for (let i = 0; i < array.length; i++) {
        const existsPromise = checkIfChampionpoolEntryExists(array[i]);
        existsPromise.then((exists) => {
            if (exists) {
                // UPDATE existing entry                                                                         // playerOfChampion,  championpoolTableType, lane, row, championName, team
                promises.push(pool.query(`UPDATE championpool SET champion = $1 WHERE lane = $2 AND row = $3`, [array[i][4], array[i][2], array[i][3]]));
            } else {
                // INSERT new entry
                console.log(array[i])
                promises.push(pool.query(`INSERT INTO championpool (type, lane, row, champion) VALUES ($1, $2, $3, $4)`, [array[i][1], array[i][2], array[i][3], array[i][4]]));
            }
        }).catch((error) => {
            // Handle any errors from the checkIfChampionpoolEntryExists function or pool.query
            console.error("Error occurred:", error);
        });
    }
    return Promise.all(promises);
}


async function checkIfChampionpoolEntryExists(data) {
    const result = await pool.query(`SELECT * FROM championpool WHERE type = $1 AND lane = $2 AND row = $3`, [data[1], data[2], data[3]]);
    return result.rows.length > 0; // Return true if the query result has any rows, indicating an entry exists.
    retur
}

module.exports = router;