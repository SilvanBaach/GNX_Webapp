const {pool} = require("./database/dbConfig");

/**
 * Checks if the user is authenticated
 * If yes, redirects to the dashboard
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/dashboard");
    }
    next();
}

/**
 * Checks if the user is not authenticated
 * If he has no session, redirects to the index page
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    return res.redirect("/")
}

/**
 * Checks if the user has the permission to access the given location
 * @param location
 * @param permission
 * @returns {(function(*, *, *): void)|*}
 */
function permissionCheck(location, permission) {
    return function(req, res, next) {
        // If location is an array, assume permissions have been passed as an array of objects
        // Otherwise, create a single-element array with the location and permission
        const permissions = Array.isArray(location) ? location : [{ location, permission }];

        hasUserPermission(req.user, permissions).then(hasPermission => {
            if (hasPermission) {
                next();
            } else {
                if (req.headers.accept.includes('application/json')) {
                    // For API requests, send a 403 status code with a JSON response
                    console.log("Forbidden");
                    res.status(403).send({ error: 'Forbidden' });
                } else {
                    // For non-API requests, redirect to the /error page
                    console.log("Forbidden: Redirecting to /error");
                    res.redirect('/error');
                }
            }
        }).catch(err => {
            console.error(err);
            if (req.headers.accept.includes('application/json')) {
                // For API requests, send a 500 status code with a JSON response
                res.status(500).send({ error: 'Internal Server Error' });
            } else {
                // For non-API requests, redirect to the /error page
                res.redirect('/error');
            }
        });
    }
}

/**
 * Checks if a user has permission to perform an action
 * @param user
 * @param permissions
 */
function hasUserPermission(user, permissions) {
    return new Promise((resolve, reject) => {
        // Create an array of promises, one for each permission check
        const permissionChecks = permissions.map(permission => {
            return new Promise((resolve, reject) => {
                pool.query(`SELECT permissiontype.location, permissiontype.permission FROM role
                            LEFT JOIN roletype ON roletype.id = role.roletype_fk
                            LEFT JOIN permission ON "permission".roletype_fk = roletype.id
                            LEFT JOIN permissiontype ON permissiontype.id = "permission".permissiontype_fk
                            WHERE roletype.id IS NOT NULL AND (role.team_fk = 2 OR role.account_fk = 10)
                            AND permissiontype.location = $1 AND permissiontype.permission = $2
                            GROUP BY permissiontype.location, permissiontype.permission`, [permission.location, permission.permission], (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results.rowCount > 0);
                    }
                });
            });
        });

        // Wait for all permission checks to complete, then if any permission check passed, resolve with true
        Promise.all(permissionChecks)
            .then(results => resolve(results.some(result => result === true)))
            .catch(err => reject(err));
    });
}

module.exports = {
    checkAuthenticated,
    checkNotAuthenticated,
    permissionCheck
}