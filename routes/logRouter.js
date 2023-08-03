/**
 * Router for manipulating logs
 */
const express = require('express');
const router = express.Router();
const {pool} = require('../js/serverJS/database/dbConfig.js');
const {checkNotAuthenticated, permissionCheck} = require("../js/serverJS/sessionChecker");
const {logMessage, LogLevel} = require('../js/serverJS/logger.js');

/**
 * GET route for getting all teams
 */
router.get('/getLogs',  checkNotAuthenticated, permissionCheck('changelog', 'canOpen'), function (req, res) {
    getLogs(req.query.date, req.query.level, req.query.userId).then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send({message: "There was an error getting logs! Please try again later."});
    });
});

/**
 * GET route for getting the action count of a day
 */
router.get('/getActionCount',  checkNotAuthenticated, permissionCheck('changelog', 'canOpen'), function (req, res) {
    getActionCount(req.query.date).then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send({message: "There was an error getting logs! Please try again later."});
    });
});

/**
 * Function which returns all logs
 */
function getLogs(date, level, userId){
    let dateObj = new Date(date);
    let dateString = dateObj.toISOString().split('T')[0];

    let queryText = `SELECT TO_CHAR(date, 'HH24:MI:SS') AS date, message, COALESCE(account.username, 'System') AS user, level 
                     FROM logs
                     LEFT JOIN account ON account.id = account_fk
                     WHERE DATE(date) = $1 `;
    let queryParams = [dateString];

    if(level != -1){
        queryText += " AND level = $2 ";
        queryParams.push(level);
    }

    if(userId != -2){
        queryText += " AND account_fk = $" + (queryParams.length + 1);
        queryParams.push(userId);
    }

    queryText += " ORDER BY date DESC";

    return pool.query(queryText, queryParams);
}

/**
 * Function which returns the action count of a day
 * @param date
 * @returns {Promise<QueryResult<any>>}
 */
function getActionCount(date){
    let dateObj = new Date(date);
    let dateString = dateObj.toISOString().split('T')[0];
    return pool.query(`SELECT COUNT(*) AS count FROM logs
                                        WHERE DATE(date) = $1`, [dateString]);
}

module.exports = router;