/**
 * Router for manipulating calendar data and definitions
 */
const express = require('express');
const router = express.Router();
const {pool} = require('../js/serverJS/database/dbConfig.js');
const {checkNotAuthenticated, permissionCheck} = require("../js/serverJS/sessionChecker");
const {logMessage, LogLevel} = require('../js/serverJS/logger.js');

/**
 * GET route for getting all calendar data for a given month
 */
router.get('/getCalendarData',  checkNotAuthenticated, permissionCheck('eventcalendar', 'canOpen'), function (req, res) {
    getCalendarData(req.query.date, req.user.id).then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send({message: "There was an error getting logs! Please try again later."});
    });
});

/**
 * GET route for getting all calendar definitions on which you have wirte access
 */
router.get('/getCalendarDefinitionsWithWriteAccess', checkNotAuthenticated, permissionCheck('eventcalendar', 'canOpen'), function (req, res) {
    getCalendarDefinitionsWithWriteAccess(req.user.id).then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send({message: "There was an error getting the calendars! Please try again later."});
    });
});

/**
 * POST route for creating a new appointment
 * TODO: Check if the user really has write access to the given calendar
 */
router.post('/insertNewAppointment', checkNotAuthenticated, permissionCheck('eventcalendar', 'canOpen'), function (req, res) {
    insertNewAppointment(req.body).then((result) => {
        logMessage(LogLevel.INFO, `User ${req.user.id} created a new appointment in calendar ${req.body.calendarId} with the text ${req.body.text}!`);
        res.status(200).send({message: 'Appointment successfully inserted!'});
    }).catch((err) => {
        console.log(err);
        res.status(500).send({message: "There was an error inserting the appointment! Please try again later."});
    });
});

/**
 * POST route to update an existing appointment
 * TODO: Check if the user really has write access to the given calendar
 */
router.post('/updateAppointment', checkNotAuthenticated, permissionCheck('eventcalendar', 'canOpen'), function (req, res) {
    updateAppointment(req.body).then((result) => {
        logMessage(LogLevel.INFO, `User ${req.user.id} updated the appointment with the id ${req.body.id} with the text ${req.body.text}!`);
        res.status(200).send({message: 'Appointment successfully updated!'});
    }).catch(() => {
        res.status(500).send({message: "There was an error getting the calendars! Please try again later."});
    });
});

/**
 * POST route to delete an existing appointment
 * TODO: Check if the user really has write access to the given calendar
 */
router.post('/deleteAppointment', checkNotAuthenticated, permissionCheck('eventcalendar', 'canOpen'), function (req, res) {
    deleteAppointment(req.body).then((result) => {
        logMessage(LogLevel.INFO, `User ${req.user.id} deleted the appointment with the id ${req.body.id}!`);
        res.status(200).send({message: 'Appointment successfully deleted!'});
    }).catch(() => {
        res.status(500).send({message: "There was an error getting the calendars! Please try again later."});
    });
});

/**
 * Returns all calendar data in the given month if the user has permission to view it
 */
function  getCalendarData(date, userId){
    const jsDate = new Date(date);
    const year = jsDate.getFullYear();
    const month = jsDate.getMonth() + 1;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return pool.query(`WITH date_series AS (
        SELECT generate_series($4::date, $5::date, '1 day'::interval) AS date)
        SELECT calendardata.id, text, wholeday, CASE WHEN wholeday = 1 THEN date_series.date ELSE calendardata.startdate END AS startdate,
               CASE WHEN wholeday = 1 THEN date_series.date ELSE calendardata.enddate END AS enddate, cd.displayname, color, tm.id AS teamId, icon FROM calendardata
        LEFT JOIN calendardefinition AS cd ON cd.id = calendardefinition_fk
        LEFT JOIN team ON team.id = cd.team_fk
        LEFT JOIN teammembership AS tm ON tm.team_fk = team.id AND tm.account_fk = $1
        LEFT JOIN date_series ON (wholeday = 1 AND date_series.date BETWEEN calendardata.startdate AND calendardata.enddate)
        WHERE cd.ispublic = 1 OR tm.id IS NOT NULL OR 1 <= (
              SELECT COUNT(*) FROM permission
                                    LEFT JOIN permissiontype AS pt ON pt.id = permission.permissiontype_fk
                                    LEFT JOIN role ON role.account_fk = $1
                                    LEFT JOIN roletype ON roletype.id = role.roletype_fk
              WHERE pt.location='eventcalendar' AND pt.permission='isAdmin' AND permission.roletype_fk = roletype.id
        )
        AND EXTRACT(MONTH FROM startdate) = $2 AND EXTRACT(YEAR FROM startdate) = $3`,[userId, month, year, startDate, endDate]);
}

/**
 * Returns all calendar definitions on which you have write access
 * @param userId
 * @returns {Promise<QueryResult<any>>}
 */
function getCalendarDefinitionsWithWriteAccess(userId){
    return pool.query(`SELECT calendardefinition.id, calendardefinition.displayname FROM calendardefinition
                                        LEFT JOIN team ON team.id = team_fk
                                        WHERE team.account_fk = $1 OR 1 = (SELECT COUNT(*) FROM accountpermission_view WHERE id = $1 AND location = 'eventcalendar' AND permission = 'isAdmin')`, [userId])
}

/**
 * Inserts a new appointment into the database
 * @param data
 */
function insertNewAppointment(data){
    // Convert the string to a Date object
    const dateObj = new Date(data.date);

    // Convert Date object to YYYY-MM-DD format
    const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;


    // Construct full timestamp strings
    let startTimestamp;
    let endTimestamp;
    let allDay;
    if (data.allDay === false) {
        startTimestamp = `${formattedDate} ${data.starttime}:00`;
        endTimestamp = `${formattedDate} ${data.endtime}:00`;
        allDay = 0;
    } else {
        const dayObjEnd = new Date(data.enddate);
        const formattedDateEnd = `${dayObjEnd.getFullYear()}-${String(dayObjEnd.getMonth() + 1).padStart(2, '0')}-${String(dayObjEnd.getDate()).padStart(2, '0')}`;
        startTimestamp = `${formattedDate} 00:00:00`;
        endTimestamp = `${formattedDateEnd} 23:59:59`;
        allDay = 1;
    }

    return pool.query(`INSERT INTO calendardata (text, startdate, enddate, calendardefinition_fk, wholeday) VALUES ($1, $2, $3, $4, $5)`, [data.text, startTimestamp, endTimestamp, data.calendarId, allDay]);
}

/**
 * Updates an existing appointment in the database
 * @param data
 * @returns {Promise<QueryResult<any>>}
 */
function updateAppointment(data){
    // Convert the string to a Date object
    const dateObj = new Date(data.date);

    // Convert Date object to YYYY-MM-DD format
    const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

    // Construct full timestamp strings
    const startTimestamp = `${formattedDate} ${data.starttime}:00`;
    const endTimestamp = `${formattedDate} ${data.endtime}:00`;

    return pool.query(`UPDATE calendardata SET text = $1, startdate = $2, enddate = $3 WHERE id = $4`, [data.text, startTimestamp, endTimestamp, data.id]);
}

/**
 * Deletes an appointment from the database
 * @param data
 * @returns {Promise<QueryResult<any>>}
 */
function deleteAppointment(data){
    return pool.query(`DELETE FROM calendardata WHERE id = $1`, [data.id]);
}

module.exports = router;