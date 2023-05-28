/**
 * @fileOverview Router for register pages
 */
const express = require('express');
const router = express.Router();

/**
 * GET register page
 */
router.get('/', (req, res) => {
    res.render('registration/register.ejs')
});

/**
 * GET name page
 */
router.get('/name', (req, res) => {
    res.render('registration/name.ejs')
});

/**
 * GET address page
 */
router.get('/address', (req, res) => {
    res.render('registration/address.ejs')
});

/**
 * GET game accounts page
 */
router.get('/gameAccounts', (req, res) => {
    res.render('registration/gameAccounts.ejs')
});

/**
 * GET success page
 */
router.get('/success', (req, res) => {
    res.render('registration/success.ejs')
});

router.post('/', async (req, res) => {
    let {username, password, password2, email, registrationCode} = req.body;
    let errors = await checkUserRegistration(registrationCode, username, email, password, password2)

    if (errors.length > 0) {
        res.render("registration/register.ejs", {errors, username, password, password2, email, registrationCode});
    } else {
        let userdata = await registerUser(registrationCode, username, email, password);
        userdata.registrationCode = registrationCode;
        userdataStorage = userdata;
        res.render('registration/name.ejs', {userdata: userdata});
    }
});

module.exports = router;