/**
 * @fileOverview Router for resetting the password
 */
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const EmailSender = require('../js/serverJS/email/emailSender.js');
const {pool} = require('../js/serverJS/database/dbConfig.js');
const util = require("util");

const passwordTokenDuration = 60 * 60; // 1 hour

/**
 * GET reset password page
 */
router.get('/', (req, res) => {
    res.render('resetPassword')
});

/**
 * POST route for sending the reset password email
 */
router.post('/sendResetEmail', async (req, res) => {
    const email = req.body.email;

    const user = await getUserByEmail(email);
    if (user.rows.length > 0) {

        //Generate reset password token
        const resetPasswordToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordExpires = Math.floor(Date.now() / 1000) + passwordTokenDuration;

        setPassResetToken(resetPasswordToken, resetPasswordExpires, email);

        //Send reset password email
        let emailObj = new EmailSender();
        emailObj.sendResetPasswordMail(email, user.rows[0].username, resetPasswordToken)
    }

    res.status(200).send({message: "E-Mail sent successfully"});
});

/**
 * GET route for resetting the password
 */
router.get('/resetPassword/:token', async (req, res) => {
    const user = await getUserByToken(req.params.token);

    if (user) {
        console.log("User found");
        if (!res.headersSent) {
            res.redirect('/');
        }
    } else {
        if (!res.headersSent) {
            res.redirect('/?message=Invalid Token!&type=error');
        }
    }
});


/**
 * Function which sets the reset password token and the reset password expires in the database
 * @param resetPasswordToken The reset password token
 * @param resetPasswordExpires When this token expires
 * @param email The email of the user
 */
function setPassResetToken(resetPasswordToken, resetPasswordExpires, email) {
    pool.query(`UPDATE account SET resetpasswordtoken = $1, resetpasswordexpires = $2 WHERE email = $3`, [resetPasswordToken, resetPasswordExpires, email]);
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
        const maxTime = Math.floor(Date.now() / 1000) + passwordTokenDuration;

        if (user.resetpasswordexpires < maxTime) {
            return user;
        }
    }
}


module.exports = router;