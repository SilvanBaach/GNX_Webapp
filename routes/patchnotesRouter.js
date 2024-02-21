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
 * GET current version
 */
router.get('/getCurrentVersion', checkNotAuthenticated, permissionCheck('adminpanel', 'canOpen'), (req, res) => {
    getLatestVersion().then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send({message: "There was an error getting the current webapp version! Please try again later."});
    });
});

/**
 * POST route for adding a new patchnote
 */
router.post('/add', checkNotAuthenticated, permissionCheck('adminpanel', 'canOpen'), (req, res) => {
    addNewPatchnote(req.body).then(() => {
        res.status(200).send({message: "Patchnote added successfully!"});
    }).catch((error) => {
        console.error('Error adding patchnote:', error);
        res.status(500).send({message: "There was an error adding the patchnote! Please try again later."});
    });
});

/**
 * Saves a new patchnote in the database
 * @param data
 */
function addNewPatchnote(data){
    console.log(data);
    return pool.query('INSERT INTO patchnotes (version, date, text) VALUES ($1, NOW(), $2)', [data.version, data.text]);
}
/**
 * Function which returns the latest patchnotes
 */
function getLatestPatches(){
    return pool.query('SELECT * FROM patchnotes ORDER BY date DESC LIMIT 4');
}

/**
 * Returns the latest version of the webapp
 * @returns {Promise<QueryResult<any>>}
 */
function getLatestVersion(){
    return pool.query('SELECT version FROM patchnotes ORDER BY string_to_array(substring(version from 2), \'.\')::int[] DESC LIMIT 1');
}

module.exports = router;