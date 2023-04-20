const express = require('express');
const {pool} = require('./js/serverJS/database/dbConfig.js');
const app = express();
const loginRouter = require('./routes/loginRouter.js');
const passport = require('passport');
const passportConfig = require('./js/serverJS/passportConfig.js');
const session = require('express-session');
const flash = require('express-flash');

/**
 * MIDDLEWARE
 */
app.set('view engine', 'ejs');

passportConfig.initialize(passport);

app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.session());
app.use(passport.initialize());

app.use(express.static(__dirname + '/'));
app.use('/login', loginRouter(passport));

/**
 * MAIN ROUTES
 */
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard', {user: req.user});
});
app.get('/register', (req, res) => {
    res.render('register', {user: req.user});
});

module.exports = app;
