/**
 * Router for manipulating training notes
 */
const express = require('express');
const router = express.Router();
const {pool} = require('../js/serverJS/database/dbConfig.js');
const {checkNotAuthenticated, permissionCheck} = require("../js/serverJS/sessionChecker");
const {logMessage, LogLevel} = require('../js/serverJS/logger.js');

/**
 * GET route for getting all training notes
 */
router.get('/getAll', checkNotAuthenticated, permissionCheck('trainingnotes', 'canOpen'), function (req, res) {
    getTrainingNotes(req.user.team.id).then((result) => {
        res.status(200).send(result.rows);
    }).catch((err) => {
        console.log("Error: " + err);
        res.status(500).send({message: "There was an error getting the training notes! Please try again later."});
    });
});

/**
 *
 */
function getTrainingNotes(teamId){
    return pool.query(`SELECT trainingnotes.id, acc1.username AS creator, acc2.username AS editor, TO_CHAR(created, 'DD.MM.YYYY HH24:MI') AS created, 
                                            TO_CHAR(lastedited, 'DD.MM.YYYY HH24:MI') AS lastedited, title, notes FROM trainingnotes
                                        LEFT JOIN account AS acc1 ON acc1.id = creator
                                        LEFT JOIN account AS acc2 ON acc2.id = editor
                                        WHERE team_fk = $1`, [teamId]);
}

module.exports = router;