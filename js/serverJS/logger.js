/**
 * This file implements methods which can be utilized to log messages to the database
 */
const {pool} = require("../../js/serverJS/database/dbConfig.js");
const os = require('os');
const LogLevel = {
    INFO: 0,
    WARNING: 1,
    ERROR: 2
};

/**
 * Logs a message to the database
 * @param message
 * @param level
 * @param userId the user which is responsible for the log (can be null)
 */
function logMessage(message, level, userId) {
    const hostname = os.hostname();
    pool.query("INSERT INTO logs (message, level, account_fk, date) VALUES ($1,$2,$3,NOW())", [hostname, level, 9999], function (err, result) {
        if (err) throw err;
    });

    if (hostname.includes('webapp')) {
        if (!userId) {
            userId = -1; //Stands for "system log"
        }

        pool.query("INSERT INTO logs (message, level, account_fk, date) VALUES ($1,$2,$3,NOW())", [message, level, userId], function (err, result) {
            if (err) throw err;
        });
    }
}

module.exports = {
    logMessage,
    LogLevel
}