/**
 * Router for all Dashboard subpages
 */
const express = require('express');
const router = express.Router();

/**
 * GET dashboard page
 */
router.get('/', (req, res) => {
    res.render('dashboard', {user: req.user});
});

/**
 * GET home page
 */
router.get('/home', function (req, res) {
    res.render('dashboard/home.ejs', {user: req.user});
});

/**
 * GET settings page
 */
router.get('/settings', function (req, res) {
    res.render('dashboard/settings.ejs', {user: req.user});
});

/**
 * GET team-management page
 */
router.get('/teammanagement', function (req, res) {
    res.render('dashboard/teammanagement.ejs', {user: req.user});
});

module.exports = router;