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
    //Checke ob ein Eintrag existiert mit folgender Bedinung (Gibt bereits type, lane, subtype)
    for(let i = 0; i < data.length; i++){
        if(checkIfChampionpoolEntryExists(data).rows[0] == false){
            pool.query(`INSERT INTO championpool (type, lane, subtype, champion) VALUES ($1, $2, $3, $4)`, [data[i].type, data[i].lane, data[i].subtype, data[i].champion]);
        }
        else{
            pool.query(`UPDATE championpool SET champion = $1 WHERE id = $2`,[arrayOfTextAndID[0], arrayOfTextAndID[1]]);
        }
    }
    return Promise.all(promises);
}

function checkIfChampionpoolEntryExists(data) {
    return pool.query(`SELECT * FROM championpool WHERE type = $1 AND lane = $2 AND subtype = $3`, [data.type, data.lane, data.subtype]);
}
module.exports = router;