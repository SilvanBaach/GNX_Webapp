const express = require('express');
const {pool} = require('./backend/database/dbConfig');
const app = express();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/frontend/index.html');
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
