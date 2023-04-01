const express = require('express');
const {pool} = require('./js/serverJS/database/dbConfig.js');
const port = process.env.PORT || 3000;
const app = express();

/**
 * MIDDLEWARE
 */
app.set('view engine', 'ejs');

app.listen(port, () => {
    console.log(`Genetix Webapp listening at http://localhost:${port}`);
});

/**
 * MAIN ROUTES
 */
app.get('/', (req, res) => {
    const someData = {
        name: 'Genetix',
        shortname: 'GNX',
    }
    res.render('index', {someData});
});