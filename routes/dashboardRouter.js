const express = require('express');
const router = express.Router();
const { checkNotAuthenticated } = require('../js/serverJS/sessionChecker.js');

/**
 * GET dashboard page
 */
router.get('/', checkNotAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.user });
});

/**
 * GET home page
 */
router.get('/home', checkNotAuthenticated, (req, res) => {
    res.render('dashboard/home.ejs', { user: req.user });
});

/**
 * GET settings page
 */
router.get('/settings', checkNotAuthenticated, (req, res) => {
    res.render('dashboard/settings.ejs', { user: req.user });
});

/**
 * GET calendar page
 */
router.get('/calendar', checkNotAuthenticated, (req, res) => {
    res.render('dashboard/calendar.ejs', { user: req.user });
});

/**
 * GET dashboard page
 */
router.get('/fileshare', checkNotAuthenticated, (req, res) => {
    res.render('dashboard/fileshare.ejs', { user: req.user });
});

/**
 * GET user-management page
 */
router.get('/usermanagement', checkNotAuthenticated, (req, res) => {
    res.render('dashboard/usermanagement.ejs', { user: req.user });
});

/**
 * GET team-management page
 */
router.get('/teammanagement', checkNotAuthenticated, (req, res) => {
    res.render('dashboard/teammanagement.ejs', { user: req.user });
});

module.exports = router;
