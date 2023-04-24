/**
 * Router for manipulating users
 */
const express = require('express');
const router = express.Router();
const {pool} = require('../js/serverJS/database/dbConfig.js');
const bcrypt = require("bcrypt");

/**
 * POST route for updating the profile picture of a user
 * Only the currently logged-in user can update his picture
 */
router.post('/updatePicture/:id',  function (req, res) {
    const userId = req.params.id;
    const base64 = req.body;

    if (req.user.id !== parseInt(userId)) {
        console.log("User tried to update the profile picture of another user!")
        res.status(500).send("There was an error updating the profile picture! Please try again later.");
        return;
    }

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
 * POST route for updating the information of a user
 */
router.post('/updateUser', function (req, res) {
    const userId = req.user.id;
    const formData = req.body;

    updateUser(formData, userId).then(() => {
        res.status(200).send({message: "Information updated successfully"});
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

/** Updates the information of a user in the database
 * This method is generic and can be used to update any field of the user
 * @param formData the data of the user
 * @param userId the id of the user
 * @returns {Promise<*>}
 */
async function updateUser(formData, userId) {
    const fields = ['fullName', 'email', 'phone', 'username', 'street', 'city', 'zip', 'steam', 'origin', 'riotgames', 'battlenet'];
    const updates = [];
    const password = formData.password;
    delete formData.password;

    fields.forEach(field => {
        if (formData[field]) {
            updates.push(`${field} = $${updates.length + 1}`);
        }
    });

    if (updates.length) {
        const query = `UPDATE account
                       SET ${updates.join(', ')}
                       WHERE id = $${updates.length + 1}`;
        const values = Object.values(formData).filter(val => val);
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

module.exports = router;