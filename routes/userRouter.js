/**
 * Router for manipulating users
 */
const express = require('express');
const router = express.Router();
const {pool} = require('../js/serverJS/database/dbConfig.js');

/**
 * POST route for updating the profile picture of a user
 * Only the currently logged-in user can update his picture
 */
router.post('/updatePicture/:id', async function (req, res) {
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
 * Updates the picture of a user in the database
 * @param base64 the base64 string of the picture
 * @param userId the id of the user
 * @returns result -1 for an error, 0 for success
 */
async function updateUserPicture(base64, userId) {
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

module.exports = router;