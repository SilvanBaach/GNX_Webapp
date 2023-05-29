/**
 * @fileOverview Router for register pages
 */
const express = require('express');
const router = express.Router();
const registrationLogic = require('../js/serverJS/registrationLogic.js');
let userdataStorage = {};

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
    res.render('registration/address.ejs', {userdata: userdataStorage})
});

/**
 * GET game accounts page
 */
router.get('/gameaccounts', (req, res) => {
    res.render('registration/gameAccounts.ejs', {userdata: userdataStorage})
});

/**
 * GET success page
 */
router.get('/success', (req, res) => {
    res.render('registration/success.ejs')
});

/**
 * POST register page
 */
router.post('/', async (req, res) => {
    let {username, password, password2, email, registrationCode} = req.body;
    let errors = await registrationLogic.checkUserRegistration(registrationCode, username, email, password, password2)

    if (errors.length > 0) {
        res.render("registration/register.ejs", {errors, username, password, password2, email, registrationCode});
    } else {
        let userdata = await registrationLogic.registerUser(registrationCode, username, email, password);
        userdata.registrationCode = registrationCode;
        userdataStorage = userdata;
        console.log("Registered user: " + userdata.id);
        res.render('registration/name.ejs', {userdata: userdata});
    }
});

module.exports = router;