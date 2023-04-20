const express = require('express');
const {pool} = require('./js/serverJS/database/dbConfig.js');
const port = process.env.PORT || 3000;
const app = express();

/**
 * MIDDLEWARE
 */
app.set('view engine', 'ejs');


app.use(express.static(__dirname + '/'));
/**
 * MAIN ROUTES
 */
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard', {user: req.user});
});
app.get('/register', (req, res) => {
    res.render('register', {user: req.user});
});

module.exports = app;
