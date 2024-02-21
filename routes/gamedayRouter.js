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
        logMessage(`New Gameday added with the title ${data.title}`, LogLevel.INFO,  req.user.id);
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
        logMessage( `Gameday with the id ${req.body.id} has been deleted`, LogLevel.INFO, req.user.id);
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
        logMessage( `New result added to gameday with the id ${data.gameday_id}`, LogLevel.INFO, req.user.id);
        res.status(200).send({message: "Result successfully submitted!"});
    }).catch(function (error) {
        console.error(error);
        res.status(500).send({message: "There was an error adding the result! Please try again later."});
    });
});

/**
 * GET route for getting results from a week of gamedays
 */
router.get('/getResults', checkNotAuthenticated, permissionCheck('adminpanel', 'canOpen'), function (req, res) {
    const monday = formatDateString(req.query.monday);
    const sunday = formatDateString(req.query.sunday);
    getResultsForWeek(monday, sunday).then(function (result) {
        res.status(200).send(result.rows);
    }).catch(function (error) {
        console.error(error);
        res.status(500).send({message: "There was an error getting the gamedays! Please try again later."});
    });
});

/**
 * GET route for getting the count of the open gameday reports
 */
router.get('/getOpenResultCount', checkNotAuthenticated, permissionCheck('adminpanel', 'canOpen'), function (req, res) {
    getOpenResultCount().then(function (result) {
        res.status(200).send(result.rows[0]);
    }).catch(function (error) {
        console.error(error);
        res.status(500).send({message: "There was an error getting the count of open gameday reports! Please try again later."});
    });
});

/**
 * Returns the count of the open gameday reports
 * @returns {Promise<QueryResult<any>>}
 */
function getOpenResultCount(){
    return pool.query(`SELECT COUNT(*) FROM gamedayreport WHERE status = 0`);
}

/**
 * POST route for updating the gameday report status
 */
router.post('/updateStatus', checkNotAuthenticated, permissionCheck('adminpanel', 'canOpen'), function (req, res) {
    updateGameDayReportStatus(req.body.gamedayreportid).then(function (result) {
        logMessage( `Gameday report with the id ${req.body.id} has been updated`, LogLevel.INFO, req.user.id);
        res.status(200).send({message: "Status successfully set to complete!"});
    }).catch(function (error) {
        console.error(error);
        res.status(500).send({message: "There was an error updating the status! Please try again later."});
    });
});

/**
 * Updates the status of a gamedayreport
 * @param id
 * @returns {Promise<QueryResult<any>>}
 */
function updateGameDayReportStatus(id){
    return pool.query("UPDATE gamedayreport SET status = 1 WHERE id = $1", [id]);
}

/**
 * Returns the results for a week
 * @param monday
 * @param sunday
 */
function getResultsForWeek(monday, sunday){
    monday = monday + ' 00:00:00';
    sunday = sunday + ' 23:59:59';

    return pool.query(`SELECT gameday.id AS gamedayid, creator.username AS creator, team.displayname AS team, title, "date", description,
                                        location, wishes, gamedayreport.id AS gamedayreportid, gamedayreport."result", gamedayreport."comment",
                                        gamedayreport.reportdate, reporter.username AS reporter, gamedayreport.status FROM gameday
                                        LEFT JOIN gamedayreport ON gamedayreport.gameday_fk = gameday.id
                                        LEFT JOIN team ON team.id = gameday.team_fk
                                        LEFT JOIN account AS creator ON creator.id = gameday.creator_fk
                                        LEFT JOIN account AS reporter ON reporter.id = gamedayreport.reporter_fk
                                        WHERE gameday.date >= $1 AND gameday.date <= $2
                                        ORDER BY gameday.date`, [monday, sunday]);
}

/**
 * Formats a date string to the correct format
 * @param dateStr
 * @returns {string}
 */
function formatDateString(dateStr) {
    // Assuming dateStr is in "dd.mm.yyyy" format
    let parts = dateStr.split('.');
    // Adjusting for month index starting from 0
    let formattedDate = new Date(parts[2], parts[1] - 1, parts[0]);
    // Add 24 hours
    formattedDate.setHours(formattedDate.getHours() + 24);
    // Converts to "yyyy-mm-dd" format
    return formattedDate.toISOString().split('T')[0];
}

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