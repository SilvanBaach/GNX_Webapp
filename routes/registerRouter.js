/**
 * @fileOverview Router for register pages
 */
const express = require('express');
const router = express.Router();
const registrationLogic = require('../js/serverJS/registrationLogic.js');
const bcrypt = require("bcrypt");

/**
 * GET register page
 */
router.get('/', (req, res) => {
    req.session.registrationStep = 0;
    res.render('registration/register.ejs');
});

/**
 * GET name page
 */
router.get('/step-1', checkRegistrationStep(1), (req, res) => {
    res.render('registration/name.ejs')
});

/**
 * GET address page
 */
router.get('/step-2', checkRegistrationStep(2), (req, res) => {
    res.render('registration/address.ejs')
});

/**
 * GET game accounts page
 */
router.get('/step-3',checkRegistrationStep(3), (req, res) => {
    res.render('registration/gameAccounts.ejs')
});

/**
 * GET success page
 */
router.get('/step-4', checkRegistrationStep(4),  (req, res) => {
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
        req.session.userdata = {};
        req.session.userdata.registrationCode = registrationCode;
        req.session.userdata.username = username;
        req.session.userdata.email = email;
        req.session.userdata.password = await bcrypt.hash(password, 10);
        req.session.registrationStep = 1;

        res.render('registration/name.ejs', {username: req.session.userdata.username});
    }
});

/**
 * POST name page
 */
router.post('/step-1', checkRegistrationStep (1), (req, res) => {
    req.session.userdata.firstname = req.body.firstname;
    req.session.userdata.lastname = req.body.lastname;

    req.session.registrationStep = 2;
    res.render('registration/address.ejs');
});

/**
 * POST address page
 */
router.post('/step-2', checkRegistrationStep (2), (req, res) => {
    req.session.userdata.street = req.body.street || "";
    req.session.userdata.city = req.body.city || "";
    req.session.userdata.zip = req.body.zip || "";

    req.session.registrationStep = 3;
    res.render('registration/gameAccounts.ejs');
});

/**
 * POST game accounts page
 */
router.post('/step-3', checkRegistrationStep (3), (req, res) => {
    req.session.userdata.steam = req.body.steam || "";
    req.session.userdata.origin = req.body.origin || "";
    req.session.userdata.riotgames = req.body.riotgames || "";
    req.session.userdata.battlenet = req.body.battlenet || "";

    req.session.registrationStep = 4;

    //now register the user in the DB
    registrationLogic.registerUser(req.session.userdata);

    res.render('registration/success.ejs');
});

/**
 * POST profile picture
 */
router.post('/registerPicture', checkRegistrationStep (1), (req, res) => {
    req.session.userdata.picture = req.body.data;
    res.status(200).send({message: "Profile picture uploaded successfully"});
});

/**
 * Checks if a user can open a certain registration step
 * @param requiredStep
 * @returns {(function(*, *, *): (*|undefined))|*}
 */
function checkRegistrationStep(requiredStep) {
    return (req, res, next) => {
        if (req.session.registrationStep !== requiredStep) {
            if (req.session.registrationStep === 0) {
                return res.redirect('/register');
            }
            return res.redirect(`/register/step-${req.session.registrationStep || 1}`);
        }
        next();
    };
}

module.exports = router;