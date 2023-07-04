/**
 * Router for manipulating users
 */
const express = require('express');
const router = express.Router();
const {pool} = require('../js/serverJS/database/dbConfig.js');
const bcrypt = require("bcrypt");
const util = require("util");
const {checkAuthenticated} = require("../js/serverJS/sessionChecker");

/**
 * POST route for updating the profile picture of a user
 * Only the currently logged-in user can update his picture
 */
router.post('/updatePicture/:id', function (req, res) {
    const userId = req.params.id;
    const base64 = req.body;

    /*if (req.user.id !== parseInt(userId)) {
        console.log("User tried to update the profile picture of another user!")
        res.status(500).send("There was an error updating the profile picture! Please try again later.");
        return;
    }*/

    updateUserPicture(base64, userId).then(() => {
        res.status(200).send({picture: base64, message: "Profile Picture updated successfully"});
    }).catch(() => {
        res.status(500).send("There was an error updating the profile picture! Please try again later.");
    });
});

/**
 * POST route for updating the password of a user
 */
router.post('/updatePassword', function (req, res) {
    const userId = req.user.id;
    const password = req.body.password1;

    updateUserPassword(password, userId).then(() => {
        res.status(200).send({message: "Password updated successfully"});
    }).catch(() => {
        res.status(500).send({message: "There was an error updating the password! Please try again later."});
    });
});

/**
 * POST route for resetting the password of a user using a token as verification
 */
router.post('/updatePassword/:token',  async function (req, res) {
    const token = req.params.token;
    const password = req.body.password;

    const user = await getUserByToken(token);
    if (user) {
        updateUserPassword(password, user.id).then(() => {
            const formData = {
                resetpasswordtoken: '',
                resetpasswordexpires: 0
            }

            //Delete the tokens
            updateUser(formData, user.id).then(() => {
                res.status(200).send();
            }).catch(() => {
                res.status(500).send({message: "There was an error updating the password! Please try again later."});
            });
        }).catch(() => {
            res.status(500).send({message: "There was an error updating the password! Please try again later."});
        });
    }else{
        res.status(500).send({message: "Invalid Token!"});
    }
});

/**
 * POST route for updating the information of a user
 */
router.post('/updateUser/:id', function (req, res) {
    const userId = req.params.id;
    const formData = req.body;
    let register = 0;

    if (formData.firstname) {
        formData.fullName = formData.firstname + " " + formData.lastname;
        register = 1;

        delete formData.firstname;
        delete formData.lastname;
    }

    if (formData.zipR){
        formData.zip = formData.zipR;
        delete formData.zipR;
        register = 2;
    }

    if (formData.steam||formData.origin||formData.riotgames||formData.battlenet) {
        register = 3;
    }

    updateUser(formData, userId).then(() => {
        if (register === 1) {
            res.redirect('/register/address')
        }else if (register === 2){
            res.redirect('/register/gameaccounts')
        }else if (register === 3){
            res.redirect('/register/success')
        }
        else {
            res.status(200).send({message: "Information updated successfully"});
        }
    }).catch(() => {
        res.status(500).send({message: "There was an error updating the information! Please try again later."});
    });
});

/**
 * GET route for getting the user list of a team
 */
router.get('/getUserList/:teamId', function (req, res) {
    const teamId = req.params.teamId;

    getUsersFromTeam(teamId).then((result) => {
        res.status(200).send(result.rows);
    }).catch(() => {
        res.status(500).send({message: "There was an error getting the user list! Please try again later."});
    });
});

router.get('/getusers', async (req, res) => {
    const users = await getUsers();
    res.send(users);
});

router.post('/deleteUser/:username', function (req, res) {
    const username = req.params.username;
    deleteUser(username).then(() => {
        res.status(200).send({message: "User deleted successfully"});
    }).catch(() => {
        res.status(500).send({message: "There was an error deleting the user! Please try again later."});
    });
});


/** Updates the information of a user in the database
 * This method is generic and can be used to update any field of the user
 * @param formData the data of the user
 * @param userId the id of the user
 * @returns {Promise<*>}
 */
async function updateUser(formData, userId) {
    const fields = ['fullName', 'email', 'phone', 'username', 'street', 'city', 'zip', 'steam', 'origin', 'riotgames', 'battlenet','resetpasswordtoken','resetpasswordexpires', 'blocked'];
    const updates = [];
    delete formData.password;

    fields.forEach(field => {
        if (formData[field] !== undefined) {
            updates.push(`${field} = $${updates.length + 1}`);
        }
    });

    if (updates.length) {
        const query = `UPDATE account
                       SET ${updates.join(', ')}
                       WHERE id = $${updates.length + 1}`;
        const values = Object.values(formData).filter(val => val !== undefined && val !== null);
        pool.query(query, [...values, parseInt(userId)], (err, result) => {
            if (err) {
                console.log(err);
                return -1;
            }
        });
    }

    return 0;
}

/**
 * Updates the picture of a user in the database
 * @param base64 the base64 string of the picture
 * @param userId the id of the user
 * @returns result -1 for an error, 0 for success
 */
function updateUserPicture(base64, userId) {
    return new Promise((resolve, reject) => {
        pool.query('UPDATE account SET picture = $1 WHERE id = $2', [Object.values(base64)[0], parseInt(userId)], (err) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
}

/**
 * Updates the password of a user in the database
 * @param password the new password
 * @param userId the id of the user
 * @returns {Promise<unknown>} a Promise that resolves if the password was updated successfully
 */
async function updateUserPassword(password, userId) {
    const hash = await bcrypt.hashSync(password, 10);

    return new Promise((resolve, reject) => {
        pool.query('UPDATE account SET password = $1 WHERE id = $2', [hash, parseInt(userId)], (err) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
}

/**
 * Gets all users from a team
 * @param teamId the id of the team
 * @returns {Promise<*>} a Promise that resolves to an array of users
 */
function getUsersFromTeam(teamId){
    return  pool.query(`SELECT username, team.id FROM account LEFT JOIN teammembership AS tm ON tm.account_fk = account.id LEFT JOIN team ON team.id = tm.team_fk WHERE team.id = $1`,[teamId]);
}

/**
 * Gets a user by his token and checks if the token is still valid
 * @param token the token of the user
 * @returns {Promise<*>} Promise that resolves to the user
 */
async function getUserByToken(token) {
    const query = util.promisify(pool.query).bind(pool);
    const result = await query('SELECT * FROM account WHERE resetpasswordtoken = $1', [token]);

    if (result.rows.length > 0) {
        const user = result.rows[0];
        const currentTime = Math.floor(Date.now() / 1000);

        if (user.resetpasswordexpires >= currentTime) {
            return user;
        }
    }
}

/**
 * Gets a user by his email
 * @param email the email of the user
 * @returns {*} Promise that resolves to the user
 */
async function getUserByEmail(email) {
    const query = util.promisify(pool.query).bind(pool);
    return query('SELECT * FROM account WHERE email = $1', [email]);
}

async function getUsers(){
    //Get the Teamtype ID
    const query = util.promisify(pool.query).bind(pool);
    const results = await query(`SELECT DISTINCT account.*, team.displayname AS team_display, team.teamtype_fk AS team_teamtype_fk, team.weight AS team_weight
                                 FROM account
                                          LEFT JOIN teammembership AS tm ON tm.account_fk = account.id
                                          LEFT JOIN team ON team.id = (
                                     SELECT t2.id
                                     FROM teammembership
                                              LEFT JOIN team AS t2 ON t2.id = team_fk
                                     WHERE account_fk = account.id
                                     ORDER BY weight DESC
                                     LIMIT 1
                                 ) ORDER BY account.username, account.id`);

    return results.rows.map(row => replaceNullWithHyphen(row));
}

function replaceNullWithHyphen(obj) {
    for (const [key, value] of Object.entries(obj)) {
        if (value === null) {
            obj[key] = '-';
        } else if (typeof value === 'object') {
            replaceNullWithHyphen(value);
        }
    }
    return obj;
}

function deleteUser(username){
    return pool.query(`DELETE
                 FROM account
                 WHERE username = $1`, [username]);
}

module.exports = {
    router,
    getUserByToken,
    getUserByEmail
};
