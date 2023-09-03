/**
 * Router for manipulating trainings
 */
const express = require('express');
const router = express.Router();
const {pool} = require('../js/serverJS/database/dbConfig.js');
const {checkNotAuthenticated, permissionCheck, isUserTeamManager} = require("../js/serverJS/sessionChecker");
const {logMessage, LogLevel} = require('../js/serverJS/logger.js');

/**
 * GET route for getting all trainings which can be fixed or edited by the team manager
 */
router.get('/getTrainingsToBeDefined', isUserTeamManager, checkNotAuthenticated, permissionCheck('calendar', 'canOpen'), function (req, res) {
    getTrainingsToBeDefined(req.query.teamId).then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send({message: "There was an error getting the trainings list! Please try again later."});
    });
});

/**
 * POST route for CRUD operations on trainings
 */
router.post('/crud', isUserTeamManager, checkNotAuthenticated, permissionCheck('calendar', 'canOpen'), function (req, res) {
    crudTrainings(req.body).then((result) => {
        res.status(200).send({message: "Successfully modified the trainings!"});
    }).catch((error) => {
        console.log(error);
        res.status(500).send({message: "There was an error modifying the trainings! Please try again later."});
    });
});

/**
 * getting all trainings which can be fixed or edited by the team manager
 * A training can be fixed if mor than 60 % of the team members are available (Lol 3 / 5 Apex 2 / 3 etc...)
 * @param teamId
 * @returns {*}
 */
function  getTrainingsToBeDefined(teamId){
    return pool.query(`SELECT * FROM trainings WHERE team_fk = $1 AND ((100 / totalplayers * playercount) >= 60 OR traningtype = 'fixed')`,[teamId]);
}

/**
 * CRUD operations on trainings
 */
function crudTrainings(data){
    if (data.action === "create"){
        return createTraining(data);
    } else if (data.action === "update"){
        return updateTraining(data);
    }else if (data.action === "delete"){
        return deleteTraining(data);
    }
}

/**
 * Inserting a new training
 * @param data
 * @returns {Promise<QueryResult<any>>}
 */
function createTraining(data){
    return pool.query(`INSERT INTO fixedtrainings (date, "from", until, team_fk) VALUES ($1, $2, $3, $4)`,[data.epochdate, data.starttime, data.endtime, data.team_fk]);
}

/**
 * Deleting an existing training
 * @param data
 * @returns {Promise<QueryResult<any>>}
 */
function deleteTraining(data) {
    return pool.query(`DELETE FROM fixedtrainings WHERE id = $1`,[data.id]);
}

/**
 * Updating an existing training
 * @param data
 * @returns {Promise<QueryResult<any>>}
 */
function updateTraining(data) {
    return pool.query(`UPDATE fixedtrainings SET "from" = $1, until = $2 WHERE id = $3`,[data.starttime, data.endtime, data.id]);
}

module.exports = router;