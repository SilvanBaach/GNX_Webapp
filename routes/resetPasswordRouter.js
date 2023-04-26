/**
 * @fileOverview Router for resetting the password
 */
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const EmailSender = require('../js/serverJS/email/emailSender.js');
const {pool} = require('../js/serverJS/database/dbConfig.js');
const util = require("util");
const {getUserByToken, getUserByEmail} = require('../routes/userRouter.js');

const passwordTokenDuration = process.env.RESET_PASSWORD_TOKEN_EXPIRATION_TIME;

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
        let resetPasswordExpires = Math.floor(Date.now() / 1000);
        resetPasswordExpires = resetPasswordExpires + parseInt(passwordTokenDuration);

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
router.get('/:token', async (req, res) => {
    const user = await getUserByToken(req.params.token);

    if (user) {
        console.log("Token is valid");
        if (!res.headersSent) {
            res.render('inputNewPassword.ejs', {token: req.params.token});
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

module.exports = router;