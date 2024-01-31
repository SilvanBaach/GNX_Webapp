const LocalStrategy = require("passport-local").Strategy;
const {pool} = require("./database/dbConfig.js");
const {getUserFields} = require("../../routes/userRouter.js");
const bcrypt = require("bcrypt");
const {logMessage, LogLevel} = require("./logger.js");

const MAX_LOGIN_ATTEMPTS = 5;

/**
 * This function initializes the passport module
 * It serves as the authenticater for the user
 * @param passport the passport module
 */
function initialize(passport) {

    /**
     * This function authenticates the user
     * @param req the request
     * @param username the username of the user
     * @param password the password of the user
     * @param done
     */
    const authenticateUser = (req, username, password, done) => {
        console.log("Authenticating user: " + username)
        pool.query(
            `SELECT account.id, username, password, loginattempts, blocked FROM account WHERE username = $1`,
            [username],
            (err, results) => {
                if (err) {
                    throw err;
                }

                if (results.rows.length > 0) {
                    const user = results.rows[0];

                    //Is the User Blocked?
                    if (user.blocked) {
                        logMessage(`User ${username} tried to login but is blocked!`, LogLevel.WARNING, user.id)
                        return done(null, false, {message: "This User is blocked! Please contact staff."});
                    }

                    bcrypt.compare(password, user.password, async (err, isMatch) => {
                        if (err) {
                            console.log(err);
                        }
                        if (isMatch) {
                            //All credentials are correct
                            //Reset bad login attempts
                            resetBadLoginAttempts(user.id)
                            logMessage(`User ${username} logged in!`, LogLevel.INFO, user.id)

                            // Clear other sessions
                            await clearOtherSessions(user.id, req.session.id);

                            return done(null, user);
                        } else {
                            //password is incorrect
                            //Add a bad login attempt to the database
                            addBadLoginAttempt(user.id, user.loginattempts)
                            logMessage(`User ${username} tried to login but password is incorrect!`, LogLevel.WARNING, user.id)
                            return done(null, false, {message: "Password is incorrect"});
                        }
                    });
                } else {
                    // No user
                    logMessage(`User ${username} tried to login but no user with that username exists!`, LogLevel.WARNING)
                    return done(null, false, {
                        message: "No user registered with that username"
                    });
                }
            }
        );
    };

    /**
     * Defines the strategy for the passport module
     */
    passport.use(
        new LocalStrategy(
            {usernameField: "username", passwordField: "password", passReqToCallback: true},
            authenticateUser
        )
    );

    // Stores user details inside session. serializeUser determines which data of the user
    // object should be stored in the session. The result of the serializeUser method is attached
    // to the session as req.session.passport.user = {}. Here for instance, it would be (as we provide
    //   the user id as the key) req.session.passport.user = {id: 'xyz'}
    passport.serializeUser((user, done) => done(null, user.id));

    // In deserializeUser that key is matched with the in memory array / database or any data resource.
    // The fetched object is attached to the request object as req.user

    passport.deserializeUser(async (id, done) => {
        const accountFields = await getUserFields();

        pool.query(`SELECT ${accountFields}
                    FROM account
                    WHERE id = $1`, [id], (err, results) => {
            if (err) {
                return done(err);
            }
            let user = results.rows[0];
            pool.query('SELECT team.id, team.displayname, team.weight, team.teamtype_fk, team.account_fk, team.salepercentage FROM team LEFT JOIN teammembership ON teammembership.team_fk = team.id WHERE teammembership.account_fk = $1 ORDER BY team.weight DESC LIMIT 1', [user.id], function (err, result) {
                if (err) {
                    return done(err);
                }
                user.team = result.rows[0];

                pool.query('SELECT * FROM subscription LEFT JOIN subscriptiondefinition ON subscriptiondefinition.id = subscription.subscriptiondefinition_fk WHERE account_fk = $1 LIMIT 1', [user.id], function (err, result) {
                    if (err) {
                        return done(err);
                    }
                    user.subscription = result.rows[0];

                    pool.query('SELECT * FROM teamtype WHERE id=$1', [user.team.teamtype_fk], function (err, result) {
                        if (err) {
                            return done(err);
                        }
                        user.teamtype = result.rows[0];

                        pool.query(`SELECT permissiontype.location, permissiontype.permission FROM role
                        LEFT JOIN roletype ON roletype.id = role.roletype_fk
                        LEFT JOIN permission ON "permission".roletype_fk = roletype.id
                        LEFT JOIN permissiontype ON permissiontype.id = "permission".permissiontype_fk
                        WHERE roletype.id IS NOT NULL AND (role.team_fk = $2 OR role.account_fk = $1)
                        GROUP BY permissiontype.location, permissiontype.permission`, [user.id, user.team.id], function (err, result) {
                            if (err) {
                                return done(err);
                            }

                            result.rows.forEach(function (row) {
                                user[row.location] = user[row.location] || {};
                                user[row.location][row.permission] = true;
                            });

                            return done(null, results.rows[0]);
                        });
                    });
                });
            });
        });
    });
}

/**
 * Adds a bad login attempt to the database
 * If the user has less than MAX_LOGIN_ATTEMPTS bad login attempts, the user is blocked
 * @param userId the id of the user
 * @param loginAttempts the number of bad login attempts before this one
 */
function addBadLoginAttempt(userId, loginAttempts) {
    const badLoginAttempts = loginAttempts + 1;
    if (badLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        //Block the user
        pool.query(
            `UPDATE account SET loginattempts = $1, blocked = true WHERE id = $2`,
            [badLoginAttempts, userId],
            (err, results) => {
                if (err) {
                    throw err;
                }
            }
        );
    } else {
        //Just add the bad login attempt
        pool.query(
            `UPDATE account SET loginattempts = $1 WHERE id = $2`,
            [badLoginAttempts, userId],
            (err, results) => {
                if (err) {
                    throw err;
                }
            }
        );
    }
}

/**
 * Resets the bad login attempts for a user
 * @param userId the id of the user
 */
function resetBadLoginAttempts(userId) {
    pool.query(
        `UPDATE account SET loginattempts = 0 WHERE id = $1`,
        [userId],
        (err, results) => {
            if (err) {
                throw err;
            }
        }
    );
}

/**
 * This function clears all sessions for a user except the current one
 */
async function clearOtherSessions(userId, currentSessionId) {
    try {
        const deleteQuery = `
            DELETE FROM session
            WHERE (sess -> 'passport' ->> 'user')::INTEGER = $1
            AND sid != $2
        `;

        // Execute the query and capture the result
        const result = await pool.query(deleteQuery, [userId, currentSessionId]);

        // Print the result to the console
        console.log("Sessions cleared:", result.rowCount); // This will print the number of rows deleted
    } catch (err) {
        console.error('Error clearing other sessions:', err);
    }
}

module.exports = {initialize}
