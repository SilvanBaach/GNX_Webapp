/**
 * Router for handling all login routes
 * @param passport - the passport object in which the user should be logged in
 * @returns {Router}
 */
module.exports = (passport) => {
    const express = require('express');
    const router = express.Router();

    /**
     * GET logout procedure
     * Redirects to the index page and displays a toast message on the client side
     */
    router.get('/logout', (req, res) => {
        req.session.destroy(function (err) {
            res.redirect('/?message=You have been successfully logged out!');
        });
    });

    /**
     * GET login page
     * Param: teamname - the teamname of the team the user wants to log in to
     */
    router.get('/:teamname', (req, res) => {
        const teamname = req.params.teamname;
        res.render('login', {teamname: teamname});
    });

    /**
     * POST login page
     * Param: teamname - the teamname of the team the user wants to log in to
     */
    router.post('/:teamname', (req, res, next) => {
        const teamname = req.params.teamname;
        passport.authenticate('local', {
            successRedirect: '/dashboard',
            failureRedirect: `/login/${teamname}`,
            failureFlash: true
        })(req, res, next);
    });

    return router;
};
