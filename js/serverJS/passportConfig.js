const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./database/dbConfig.js");
const bcrypt = require("bcrypt");

const MAX_LOGIN_ATTEMPTS = 5;

/**
 * This function initializes the passport module
 * It serves as the authenticater for the user
 * @param passport the passport module
 */
function initialize(passport) {

    /**
     * This function authenticates the user
     * @param username the username of the user
     * @param password the password of the user
     * @param done
     */
    const authenticateUser = (username, password, done) => {
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
                        return done(null, false, { message: "This User is blocked! Please contact staff." });
                    }

                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) {
                            console.log(err);
                        }
                        if (isMatch) {
                            //All credentials are correct
                            //Reset bad login attempts
                            resetBadLoginAttempts(user.id)
                            return done(null, user);
                        } else {
                            //password is incorrect
                            //Add a bad login attempt to the database
                            addBadLoginAttempt(user.id, user.loginattempts)
                            return done(null, false, { message: "Password is incorrect" });
                        }
                    });
                } else {
                    // No user
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
            { usernameField: "username", passwordField: "password" },
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

    passport.deserializeUser((id, done) => {
        pool.query(`SELECT *
                    FROM account
                    WHERE id = $1`, [id], (err, results) => {
            if (err) {
                return done(err);
            }
            let user = results.rows[0];
            pool.query('SELECT team.id, team.displayname, team.weight FROM team LEFT JOIN teammembership ON teammembership.team_fk = team.id WHERE teammembership.account_fk = $1 ORDER BY team.weight DESC LIMIT 1', [user.id], function (err, result) {
                if (err) {
                    return done(err);
                }
                user.team = result.rows[0];

                return done(null, results.rows[0]);
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
function addBadLoginAttempt(userId, loginAttempts){
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
    }else{
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
function resetBadLoginAttempts(userId){
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

module.exports = {initialize}
