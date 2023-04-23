const express = require('express');
const app = express();
const passport = require('passport');
const passportConfig = require('./js/serverJS/passportConfig.js');
const session = require('express-session');
const flash = require('express-flash');
const loginRouter = require('./routes/loginRouter.js');
const dashboardRouter = require('./routes/dashboardRouter.js');

/**
 * MIDDLEWARE
 */
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

/**
 * PASSPORT SETUP / SESSION HANDLING
 */
passportConfig.initialize(passport);
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.session());
app.use(passport.initialize());

/**
 * ROUTERS
 */
app.use('/login', loginRouter(passport));
app.use('/dashboard', dashboardRouter);
app.use('/user', require('./routes/userRouter.js'));

/**
 * MAIN ROUTES
 */
app.get('/', checkAuthenticated,(req, res) => {
    res.render('index');
});

app.get('/register', (req, res) => {
    res.render('register');
});


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
    res.redirect("/");
}

module.exports = app;
