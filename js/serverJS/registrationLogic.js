const bcrypt = require("bcrypt");
const {pool} = require("../../js/serverJS/database/dbConfig.js");
const util = require('util');
const {isPasswordSecure} = require('../../js/clientJS/passwordChecker.js');

/**
 * Checks if a registration code is valid
 * @param code the registration code
 * @returns {Promise<number>} 0 if valid, -1 if invalid
 */
async function isRegisterCodeValid(code) {
    const now = new Date();
    const epochNow = Math.floor(now.getTime() / 1000) + 24 * 60 * 60;

    const query = util.promisify(pool.query).bind(pool);
    const results = await query(`SELECT *
                                 FROM registrationcode
                                 WHERE used = $1
                                   AND validuntil > $2`, [0, epochNow]);

    if (results.rows.length === 0) {
        return -1;
    } else {
        let found = false;
        for (const row of results.rows) {
            if (row.code === code) {
                found = true;
            }
        }

        if (!found) {
            return -1;
        }
    }

    return 0;
}

/**
 * Registers a user
 * @param registrationCode  the registration code
 * @param username the username
 * @param email the email
 * @param password the password
 * @returns {Promise<*>}
 */
async function registerUser(registrationCode, username, email, password) {
    let hashedPassword = await bcrypt.hash(password, 10);

    //Register the user in DB
    const query = util.promisify(pool.query).bind(pool);
    const result = await query(`INSERT INTO account (username, password, email) VALUES ($1, $2, $3) RETURNING id, password, email, username`, [username, hashedPassword, email]);

    //Make a teamlink for the user
    const teamId = await query(`SELECT teamtype_fk FROM registrationcode WHERE code = $1`, [registrationCode]);
    await query(`INSERT INTO teammembership (id, account_fk, team_fk) VALUES (DEFAULT, $1, $2)`, [result.rows[0].id, teamId.rows[0].teamtype_fk]);

    //Make Registration Code invalid
    await query(`UPDATE registrationcode SET used = $1 WHERE code = $2`, [1, registrationCode]);

    return result.rows[0];
}

/**
 * Checks if all entered user data is valid
 * Returns an error message array
 */
async function checkUserRegistration(code, username, email, password, password2) {
    let errors = [];

    //Check if password is long enough
    if (password.length < 8) {
        errors.push({message: "Password must be a least 8 characters long"});
    }

    //Check if passwords match
    if (password !== password2) {
        errors.push({message: "Passwords do not match"});
    }

    //Check if password is secure
    const isSecure = isPasswordSecure(password);
    if (!isSecure) {
        errors.push({message: "Password is not secure enough"});
    }

    //Check if registration code is valid
    const isRegisterCodeValid = await this.isRegisterCodeValid(code);
    if (isRegisterCodeValid === -1) {
        errors.push({message: "Registration code is invalid"});
    }

    //Check if username is unique
    const results2 = await pool.query(`SELECT * FROM account WHERE username = $1`, [username]);

    if (results2.rows.length > 0) {
        errors.push({message: "Username is already taken"});
    }

    return errors;
}

module.exports = {registerUser, checkUserRegistration, isRegisterCodeValid};