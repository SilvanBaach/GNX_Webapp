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
 * POST route for assigning a role type to a team
 */
router.post('/assignrole', checkNotAuthenticated, function (req, res) {
    assignRole(req.body.roleId, req.body.teamId, req.body.userId).then(() => {
        res.status(200).send("Role assigned successfully!");
    }).catch(() => {
        res.status(500).send("There was an error assigning the role! Please try again later.");
    });
});

/**
 * POST route for updating a role type
 */
router.post('/update', checkNotAuthenticated, function (req, res) {
    updateRoleType(req.body.roleTypeId, req.body.name, req.body.description).then(() => {
        res.status(200).send({message: "Role type updated successfully!"});
    }).catch(() => {
        res.status(500).send({message: "There was an error updating the role type! Please try again later."});
    });
});

/**
 * Gets all role types from the database
 * @returns {Promise<*>}
 */
function getRoleTypes(){
    return pool.query("SELECT * FROM roletype ORDER BY id ASC");
}

/**
 * Inserts a new role type into the database
 * @param name the name of the role type
 * @param description the description of the role type
 * @returns {Promise<*>} the result of the query
 */
function insertNewRoleType(name, description){
    return pool.query("INSERT INTO roletype (displayname, description) VALUES ($1, $2)", [name, description]);
}

/**
 * Updates the role type definition
 * @param id
 * @param name
 * @param description
 * @returns {Promise<QueryResult<any>>}
 */
function updateRoleType(id, name, description){
    return pool.query("UPDATE roletype SET displayname = $1, description = $2 WHERE id = $3", [name, description, id]);
}

/**
 * Assigns a role to a team
 * @param roleId
 * @param teamId
 * @returns {Promise<QueryResult<any>>}
 */
function assignRole(roleId, teamId, userId){
    if (!teamId){
        teamId = 0
    }

    if (!userId){
        userId = 0
    }

    return pool.query("INSERT INTO role(roletype_fk, team_fk, account_fk) VALUES ($1, $2, $3)", [roleId, teamId, userId]);
}

module.exports = router;