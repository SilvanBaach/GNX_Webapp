/**
 * Router for manipulating team types
 */
const express = require('express');
const router = express.Router();
const {pool} = require('../js/serverJS/database/dbConfig.js');
const util = require("util");
const {checkNotAuthenticated, permissionCheck} = require("../js/serverJS/sessionChecker");
const {logMessage, LogLevel} = require('../js/serverJS/logger.js');

/**
 * POST route for creating a new gameday
 */
router.post('/new', checkNotAuthenticated, permissionCheck('gameday', 'canOpen'), function (req, res) {
    let data = req.body;
    data.team_fk = req.user.team.id
    data.creator_fk = req.user.id;

    insertNewGameday(data).then(function (result) {
        logMessage(LogLevel.INFO, `New Gameday added with the title ${data.title}`, req.user.id);
        res.status(200).send({message: "Gameday successfully added!"});
    }).catch(function (error) {
        console.error(error);
        res.status(500).send({message: "There was an error adding the gameday! Please try again later."});
    });
});

/**
 * GET route getting all gamedays from one team
 */
router.get('/getAllForTeam', checkNotAuthenticated, permissionCheck('gameday', 'canOpen'), function (req, res) {
    getGamedaysForTeam(req.user.team.id, true).then(function (result) {
        res.status(200).send(result.rows);
    }).catch(function (error) {
        console.error(error);
        res.status(500).send({message: "There was an error getting the gamedays! Please try again later."});
    });
});

/**
 * GET route getting all not reported gamedays from one team
 */
router.get('/getNotReportedForTeam', checkNotAuthenticated, permissionCheck('gameday', 'canOpen'), function (req, res) {
    getGamedaysForTeam(req.user.team.id).then(function (result) {
        res.status(200).send(result.rows);
    }).catch(function (error) {
        console.error(error);
        res.status(500).send({message: "There was an error getting the gamedays! Please try again later."});
    });
});

/**
 * DELETE route for deleting a gameday
 */
router.delete('/delete', checkNotAuthenticated, permissionCheck('gameday', 'canOpen'), function (req, res) {
    deleteGameday(req.body.id).then(function (result) {
        logMessage(LogLevel.INFO, `Gameday with the id ${req.body.id} has been deleted`, req.user.id);
        res.status(200).send({message: "Gameday successfully deleted!"});
    }).catch(function (error) {
        console.error(error);
        res.status(500).send({message: "There was an error deleting the gameday! Please try again later."});
    });
});

/**
 * POST route for submitting a new result to a gameday
 */
router.post('/submitResult', checkNotAuthenticated, permissionCheck('gameday', 'canOpen'), function (req, res) {
    let data = req.body;
    data.user_id = req.user.id;

    insertNewResult(data).then(function (result) {
        logMessage(LogLevel.INFO, `New result added to gameday with the id ${data.gameday_id}`, req.user.id);
        res.status(200).send({message: "Result successfully submitted!"});
    }).catch(function (error) {
        console.error(error);
        res.status(500).send({message: "There was an error adding the result! Please try again later."});
    });
});

/**
 * Inserts a new result into the database
 * @param data
 * @returns {Promise<QueryResult<any>>}
 */
function insertNewResult(data){
    return pool.query("INSERT INTO gamedayreport (gameday_fk, result, comment, reportdate, reporter_fk) VALUES ($1, $2, $3, NOW(), $4)", [data.gameday_id, data.result, data.comment, data.user_id]);
}

/**
 * Inserts a new gameday into the database
 * @param data
 * @returns {Promise<QueryResult<any>>}
 */
function insertNewGameday(data){
    return pool.query("INSERT INTO gameday (team_fk, creator_fk, title, date, description, location, wishes) VALUES ($1, $2, $3, $4, $5, $6, $7)", [data.team_fk, data.creator_fk, data.title, data.date, data.description, data.location, data.wishes]);
}

/**
 * Deletes a gameday from the database
 * @param id
 * @returns {Promise<QueryResult<any>>}
 */
function deleteGameday(id){
    return pool.query("DELETE FROM gameday WHERE id = $1", [id]);
}

/**
 * Get all gamedays from one team
 * @param teamId
 * @param all if all = false only not reported gamedays are shown
 * @returns {Promise<QueryResult<any>>}
 */
function getGamedaysForTeam(teamId, all = false){
    if(all){
        return pool.query("SELECT *, EXISTS (SELECT * FROM gamedayreport WHERE gameday_fk = gameday.id) AS isreported FROM gameday WHERE team_fk = $1 ORDER BY date ASC", [teamId]);
    }

    return pool.query("SELECT *, EXISTS (SELECT * FROM gamedayreport WHERE gameday_fk = gameday.id) AS isreported FROM gameday WHERE team_fk = $1 AND id NOT IN (SELECT gameday_fk FROM gamedayreport) ORDER BY date ASC", [teamId]);
}
module.exports = router;