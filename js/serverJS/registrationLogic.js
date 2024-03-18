const {pool} = require("../../js/serverJS/database/dbConfig.js");
const util = require('util');
const {isPasswordSecure} = require('../clientJS/utility/passwordChecker.js');

/**
 * Checks if a registration code is valid
 * @param code the registration code
 * @returns {Promise<number>} 0 if valid, -1 if invalid
 */
async function isRegisterCodeValid(code) {
    const now = new Date();
    const epochNow = Math.floor(now.getTime() / 1000);

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
 * @param userdata all the data which the user entered at the registration process
 */
async function registerUser(userdata) {
    let query = util.promisify(pool.query).bind(pool);

    let zip = parseInt(userdata.zip);
    if (isNaN(zip)) {
        zip = null;
    }
    let fullName = `${userdata.firstname} ${userdata.lastname}`;

    let result = await query(`INSERT INTO account (username, password, email, picture, fullname, street, city, zip, steam, origin, riotgames, battlenet) 
            VALUES ($1, $2, $3, $4, $5,$6, $7, $8, $9, $10, $11, $12) RETURNING id`,
        [userdata.username, userdata.password, userdata.email, userdata.picture, fullName, userdata.street, userdata.city,
            zip, userdata.steam, userdata.origin, userdata.riotgames, userdata.battlenet])

    const userId = result.rows[0].id;

    result = await query(`SELECT team_fk FROM registrationcode WHERE code = $1`, [userdata.registrationCode]);
    const teamId = result.rows[0].team_fk;

    await query(`INSERT INTO teammembership (id, account_fk, team_fk) VALUES (DEFAULT, $1, $2)`, [userId, teamId]);
    await query(`UPDATE registrationcode SET used = $1 WHERE code = $2`, [1, userdata.registrationCode]);
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
        errors.push({message: "Password is not secure enough! 1 Uppercase, 1 Lowercase, 1 Number required"});
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