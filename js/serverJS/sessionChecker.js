/**
 * Checks if the user is authenticated
 * If yes, redirects to the dashboard
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/dashboard");
    }
    next();
}

/**
 * Checks if the user is not authenticated
 * If he has no session, redirects to the index page
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    return res.redirect("/")
}

module.exports = {
    checkAuthenticated,
    checkNotAuthenticated
}