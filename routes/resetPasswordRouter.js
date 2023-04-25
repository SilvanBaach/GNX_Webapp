/**
 * @fileOverview Router for resetting the password
 */
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const {pool} = require('../js/serverJS/database/dbConfig.js');

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
router.post('/sendResetEmail', (req, res) => {
    const email = req.body.email;
    console.log(email);

    //Generate reset password token
    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = Math.floor(Date.now() / 1000) + passwordTokenDuration;

    setPassResetToken(resetPasswordToken, resetPasswordExpires, email);

    res.status(200).send({message: "E-Mail sent successfully"});
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