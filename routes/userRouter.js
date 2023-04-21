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

module.exports = router;