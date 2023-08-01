/**
 * Router for all manipulation of presence data
 */
const express = require('express');
const router = express.Router();
const {pool} = require('../js/serverJS/database/dbConfig.js');
const util = require("util");
const { checkNotAuthenticated } = require('../js/serverJS/sessionChecker.js'); //If not logged in to Index

/**
 * GET route for getting the unassigned permissions of a role
 */
router.get('/getunassignedpermissions', checkNotAuthenticated, function (req, res) {
    getUnAssignedPermissions(req.query.roleId).then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send("There was an error getting the unassigned permissions! Please try again later.");
    });
});

/**
 * GET route for getting the assigned permissions of a role
 */
router.get('/getassignedpermissions', checkNotAuthenticated, function (req, res) {
    getAssignedPermissions(req.query.roleId).then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send("There was an error getting the assigned permissions! Please try again later.");
    });
});

/**
 * POST route for assigning a permission to a role
 */
router.post('/assignpermission', checkNotAuthenticated, function (req, res) {
    assignPermission(req.body.roleId, req.body.permissionTypeId).then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send("There was an error assigning the permission! Please try again later.");
    });
});

/**
 * POST route for deassign a permission from a role
 */
router.post('/deassignpermission', checkNotAuthenticated, function (req, res) {
    unassignPermission(req.body.roleId, req.body.permissionTypeId).then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send("There was an error dessigning the permission! Please try again later.");
    });
});

/**
 * Select all assigned permissions from a role
 * @param id
 * @returns {Promise<QueryResult<any>>}
 */
function getAssignedPermissions(id){
    return pool.query(`SELECT pt.id, pt.location, pt."permission", pt.description FROM "permission"
                                       LEFT JOIN permissiontype AS pt ON pt.id = permissiontype_fk
                                        WHERE roletype_fk = $1`, [id]);
}

/**
 * Select all unassigned permissions from a role
 * @param id
 * @returns {Promise<QueryResult<any>>}
 */
function getUnAssignedPermissions(id){
    return pool.query(`WITH assigned AS (
                                                            SELECT pt.id FROM "permission"
                                                            LEFT JOIN permissiontype AS pt ON pt.id = permissiontype_fk
                                                            WHERE roletype_fk = $1
                                                         )

                                       SELECT * FROM permissiontype
                                       WHERE id NOT IN (SELECT * FROM assigned)`, [id]);
}

/**
 * Assign a permission to a role
 * @param roleId
 * @param permissiontypeId
 * @returns {Promise<QueryResult<any>>}
 */
function assignPermission(roleId, permissiontypeId){
    return pool.query(`
        INSERT INTO "permission" (roletype_fk, permissiontype_fk) VALUES ($1, $2) 
        ON CONFLICT (roletype_fk, permissiontype_fk) 
        DO UPDATE SET roletype_fk = EXCLUDED.roletype_fk, permissiontype_fk = EXCLUDED.permissiontype_fk
    `, [roleId, permissiontypeId]);
}

/**
 * Unassign a permission from a role
 * @param roleId
 * @param permissiontypeId
 * @returns {Promise<QueryResult<any>>}
 */
function unassignPermission(roleId, permissiontypeId){
    return pool.query(`
        DELETE FROM "permission" WHERE roletype_fk = $1 AND permissiontype_fk = $2
    `, [roleId, permissiontypeId]);
}

module.exports = router;