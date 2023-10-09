/**
 * Router for handling all login routes
 * @param passport - the passport object in which the user should be logged in
 * @returns {Router}
 */
const { checkAuthenticated } = require('../js/serverJS/sessionChecker.js'); //If logged in to Dashboard
const { checkNotAuthenticated } = require('../js/serverJS/sessionChecker.js'); //If not logged in to Index
const {logMessage, LogLevel} = require('../js/serverJS/logger.js');

module.exports = (passport) => {
    const express = require('express');
    const router = express.Router();

    /**
     * GET logout procedure
     * Redirects to the index page and displays a toast message on the client side
     */
    router.get('/logout', checkNotAuthenticated, (req, res) => {
        logMessage(`User ${req.user.username} logged out`, LogLevel.INFO, req.user.id)
        req.session.destroy(function (err) {
            res.redirect('/?message=You have been successfully logged out!');
        });
    });

    /**
     * GET login page
     * Param: teamname - the teamname of the team the user wants to log in to
     */
    router.get('/', checkAuthenticated, (req, res) => {
        res.render('login');
    });

    /**
     * POST login page
     */
    router.post('/', checkAuthenticated, (req, res, next) => {
        passport.authenticate('local', {
            successRedirect: '/dashboard',
            failureRedirect: `/login`,
            failureFlash: true
        })(req, res, next);
    });

    return router;
};
