/**
 * Router for manipulating teams
 */
const express = require('express');
const router = express.Router();
const {pool} = require('../js/serverJS/database/dbConfig.js');
const {checkNotAuthenticated} = require("../js/serverJS/sessionChecker");

/**
 * GET route for getting all role types
 */
router.get('/getRoleTypes',  checkNotAuthenticated, function (req, res) {
    getRoleTypes().then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send({message: "There was an error getting the role type list! Please try again later."});
    });
});

/**
 * POST route for creating a new role type
 */
router.post('/createRoleType', checkNotAuthenticated, function (req, res) {
    insertNewRoleType(req.body.name, req.body.description).then(() => {
        res.status(200).send({message: "Role type created successfully!"});
    }).catch(() => {
        res.status(500).send({message: "There was an error creating the role type! Please try again later."});
    });
});

/**
 * Gets all role types from the database
 * @returns {Promise<*>}
 */
function getRoleTypes(){
    return pool.query("SELECT * FROM roletype");
}

/**
 * Inserts a new role type into the database
 * @param name the name of the role type
 * @param description the description of the role type
 * @returns {Promise<*>} the result of the query
 */
function insertNewRoleType(name, description){
    return pool.query("INSERT INTO roletype (displayname, description) VALUES ($1, $2)", [name, description]);
};

module.exports = router;