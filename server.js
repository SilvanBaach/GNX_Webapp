const express = require('express');
const { pool } = require('./js/serverJS/database/dbConfig.js');
const app = express();

/**
 * MIDDLEWARE
 */
app.set('view engine', 'ejs');

/**
 * MAIN ROUTES
 */
app.get('/', (req, res) => {
    const someData = {
        name: 'Genetix',
        shortname: 'GNX',
    }
    res.render('index', { someData });
});

module.exports = app;
