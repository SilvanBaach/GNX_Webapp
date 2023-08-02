/**
 * Router for manipulating teams
 */
const express = require('express');
const router = express.Router();
const {pool} = require('../js/serverJS/database/dbConfig.js');
const {checkNotAuthenticated, permissionCheck} = require("../js/serverJS/sessionChecker");
const {logMessage, LogLevel} = require('../js/serverJS/logger.js');

/**
 * GET route for getting all role types
 */
router.get('/getRoleTypes',  checkNotAuthenticated, permissionCheck('rolemanagement', 'canOpen'), function (req, res) {
    getRoleTypes().then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send({message: "There was an error getting the role type list! Please try again later."});
    });
});

/**
 * GET route for getting all role types by team
 */
router.get('/getRoleTypesByTeam',  checkNotAuthenticated, permissionCheck('rolemanagement', 'canOpen'), function (req, res) {
    getRoleTypesByTeam(req.query.teamId).then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send({message: "There was an error getting the role type list! Please try again later."});
    });
});

/**
 * GET route for getting all role types by user
 */
router.get('/getRoleTypesByUser',  checkNotAuthenticated, permissionCheck('rolemanagement', 'canOpen'), function (req, res) {
    getRoleTypesByUser(req.query.userId).then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send({message: "There was an error getting the role type list! Please try again later."});
    });
});

/**
 * POST route for creating a new role type
 */
router.post('/createRoleType', checkNotAuthenticated, permissionCheck('rolemanagement', 'canOpen'), function (req, res) {
    insertNewRoleType(req.body.name, req.body.description).then(() => {
        logMessage(`User ${req.user.username} created the role type ${req.body.name}`,LogLevel.INFO,req.user.id)
        res.status(200).send({message: "Role type created successfully!"});
    }).catch(() => {
        res.status(500).send({message: "There was an error creating the role type! Please try again later."});
    });
});

/**
 * POST route for assigning a role type to a team
 */
router.post('/assignrole', checkNotAuthenticated, permissionCheck('rolemanagement', 'canOpen'), function (req, res) {
    assignRole(req.body.roleId, req.body.teamId, req.body.userId).then(() => {
        logMessage(`User ${req.user.username} assigned the role type ${req.body.roleId} to the team ${req.body.teamId} or the user ${req.body.userId}`,LogLevel.INFO,req.user.id)
        res.status(200).send("Role assigned successfully!");
    }).catch(() => {
        res.status(500).send("There was an error assigning the role! Please try again later.");
    });
});

/**
 * POST route for removing a role type to a team
 */
router.post('/unassignrole', checkNotAuthenticated, permissionCheck('rolemanagement', 'canOpen'), function (req, res) {
    unassignRole(req.body.roleId, req.body.teamId, req.body.userId).then(() => {
        logMessage(`User ${req.user.username} unassigned the role type ${req.body.roleId} to the team ${req.body.teamId} or the user ${req.body.userId}`,LogLevel.INFO,req.user.id)
        res.status(200).send("Role removed successfully!");
    }).catch(() => {
        res.status(500).send("There was an error removing the role! Please try again later.");
    });
});

/**
 * POST route for updating a role type
 */
router.post('/update', checkNotAuthenticated, permissionCheck('rolemanagement', 'canOpen'), function (req, res) {
    updateRoleType(req.body.roleTypeId, req.body.name, req.body.description).then(() => {
        logMessage(`User ${req.user.username} updated the role type ${req.body.name}`,LogLevel.INFO,req.user.id)
        res.status(200).send({message: "Role type updated successfully!"});
    }).catch(() => {
        res.status(500).send({message: "There was an error updating the role type! Please try again later."});
    });
});

/**
 * POST route for deleting a role type
 */
router.post('/delete', checkNotAuthenticated, permissionCheck('rolemanagement', 'canOpen'), function (req, res) {
    deleteRoleType(req.body.roleTypeId, req.body.name, req.body.description).then(() => {
        logMessage(`User ${req.user.username} deleted the role type ${req.body.name}`,LogLevel.INFO,req.user.id)
        res.status(200).send({message: "Role type deleted successfully!"});
    }).catch(() => {
        res.status(500).send({message: "There was an error deleting the role type! Please try again later."});
    });
});

/**
 * Gets all role types from the database
 * @returns {Promise<*>}
 */
function getRoleTypes(){
    return pool.query('SELECT *, (SELECT COUNT(*) FROM permission WHERE roletype_fk = roletype.id) AS permissioncount FROM roletype ORDER BY id ASC');
}

/**
 * Gets all role types from the database from a team
 * @returns {Promise<*>}
 */
function getRoleTypesByTeam(teamId){
    return pool.query('SELECT roletype.id, displayname FROM roletype LEFT JOIN "role" AS r ON r.roletype_fk = roletype.id WHERE r.team_fk = $1 ORDER BY roletype.id ASC', [teamId]);
}

/**
 * Gets all role types from the database from a user
 * @returns {Promise<*>}
 */
function getRoleTypesByUser(userId){
    return pool.query('SELECT roletype.id, displayname FROM roletype LEFT JOIN "role" AS r ON r.roletype_fk = roletype.id WHERE r.account_fk = $1 ORDER BY roletype.id ASC', [userId]);
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

/**
 * Remove a role to a team
 * @param roleId
 * @param teamId
 * @returns {Promise<QueryResult<any>>}
 */
function unassignRole(roleId, teamId, userId){
    if (!teamId){
        return pool.query("DELETE FROM role WHERE roletype_fk = $1 AND account_fk = $2", [roleId, userId])
    }

    if (!userId){
        return pool.query("DELETE FROM role WHERE roletype_fk = $1 AND team_fk = $2", [roleId, teamId])
    }

    return null;
}

/**
 * Deletes a role type from the database
 * @param roleTypeId
 * @returns {Promise<QueryResult<any>>}
 */
function deleteRoleType(roleTypeId){
    return pool.query("DELETE FROM roletype WHERE id = $1", [roleTypeId]);
}

module.exports = router;