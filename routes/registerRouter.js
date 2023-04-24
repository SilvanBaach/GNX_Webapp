/**
 * @fileOverview Router for register pages
 */
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('registration/register.ejs')
});

router.get('/name', (req, res) => {
    res.render('registration/name.ejs')
});

router.get('/address', (req, res) => {
    res.render('registration/address.ejs')
});

router.get('/gameAccounts', (req, res) => {
    res.render('registration/gameAccounts.ejs')
});

router.get('/success', (req, res) => {
    res.render('registration/success.ejs')
});

module.exports = router;