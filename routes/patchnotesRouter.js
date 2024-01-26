/**
 * Router for manipulating patchnotes
 */
const express = require('express');
const router = express.Router();
const {pool} = require('../js/serverJS/database/dbConfig.js');
const {checkNotAuthenticated, permissionCheck} = require("../js/serverJS/sessionChecker");
const {logMessage, LogLevel} = require('../js/serverJS/logger.js');

/**
 * GET route for getting the last 4 patches
 */
router.get('/latest', checkNotAuthenticated, permissionCheck('home', 'canOpen'), (req, res) => {
    getLatestPatches().then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send({message: "There was an error getting the patchnotes! Please try again later."});
    });
});

/**
 * Function which returns the latest patchnotes
 */
function getLatestPatches(){
    return pool.query('SELECT * FROM patchnotes ORDER BY date DESC LIMIT 4');
}

module.exports = router;