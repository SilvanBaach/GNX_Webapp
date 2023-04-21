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

module.exports = router;