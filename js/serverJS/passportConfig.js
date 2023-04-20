const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./database/dbConfig.js");
const bcrypt = require("bcrypt");

function initialize(passport) {
    console.log("Initialized");

    const authenticateUser = (username, password, done) => {
        console.log("Authenticating user: " + username)
        pool.query(
            `SELECT account.id, username, password FROM account WHERE username = $1`,
            [username],
            (err, results) => {
                if (err) {
                    throw err;
                }

                if (results.rows.length > 0) {
                    const user = results.rows[0];

                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) {
                            console.log(err);
                        }
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            //password is incorrect
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

module.exports = {initialize}
