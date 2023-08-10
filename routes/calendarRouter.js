/**
 * Router for manipulating calendar data and definitions
 */
const express = require('express');
const router = express.Router();
const {pool} = require('../js/serverJS/database/dbConfig.js');
const {checkNotAuthenticated, permissionCheck} = require("../js/serverJS/sessionChecker");
const {logMessage, LogLevel} = require('../js/serverJS/logger.js');

/**
 * GET route for getting all teams
 */
router.get('/getCalendarData',  checkNotAuthenticated, permissionCheck('eventcalendar', 'canOpen'), function (req, res) {
    getCalendarData(req.query.date, req.user.id).then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send({message: "There was an error getting logs! Please try again later."});
    });
});

/**
 * Returns all calendar data in the given month if the user has permission to view it
 */
function  getCalendarData(date, userId){
    const jsDate = new Date(date);
    const year = jsDate.getFullYear();
    const month = jsDate.getMonth() + 1;

    return pool.query(`SELECT text, wholeday, startdate, enddate, cd.displayname, color, tm.id, icon FROM calendardata
                                        LEFT JOIN calendardefinition AS cd ON cd.id = calendardefinition_fk
                                        LEFT JOIN team ON team.id = cd.team_fk
                                        LEFT JOIN teammembership AS tm ON tm.team_fk = team.id AND tm.account_fk = $1
                                        WHERE cd.ispublic = 1 OR tm.id IS NOT NULL OR 1 <= (SELECT COUNT(*) FROM permission 
                                                                                            LEFT JOIN permissiontype AS pt ON pt.id = permission.permissiontype_fk
                                                                                            LEFT JOIN role ON role.account_fk = $1
                                                                                            LEFT JOIN roletype ON roletype.id = role.roletype_fk
                                                                                            WHERE pt.location='eventcalendar' AND pt.permission='isAdmin' AND permission.roletype_fk = roletype.id)
                                        AND EXTRACT(MONTH FROM startdate) = $2 AND EXTRACT(YEAR FROM startdate) =  $3`,[userId, month, year]);
}

module.exports = router;