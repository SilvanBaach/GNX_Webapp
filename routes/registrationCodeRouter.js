/**
 * Router for manipulating team types
 */
const express = require('express');
const router = express.Router();
const {pool} = require('../js/serverJS/database/dbConfig.js');
const util = require("util");

router.post('/generateNewRegistrationCode/:teamtype', function (req, res) {
    const teamtype = req.params.teamtype;
    generateNewRegistrationCode(teamtype);
    res.status(200).send("New Registration Code generated successfully");
});

router.get('/getregistrationcodes', async (req, res) => {
    const registrationCodes = await getRegistrationCodes();
    res.send(registrationCodes);
});

router.post('/updateRegistrationCode/:code/:used', function (req, res) {
    const regCode = req.params.code;
    const used = req.params.used;
    updateRegistrationCode(regCode, used);
    res.status(200).send("Registration Code updated successfully");
});

async function generateNewRegistrationCode(teamtype) {
    //Generate Random Number as Code
    const min = 1000000;
    const max = 100000000;
    const randomNum = Math.floor(Math.random() * (max - min) + min);

    //Generate valid until date
    const now = new Date();
    const epochTomorrow = Math.floor(now.getTime() / 1000) + 24 * 60 * 60;

    //Get the Teamtype ID
    const query = util.promisify(pool.query).bind(pool);
    const results = await query(`SELECT id
                                 FROM teamtype
                                 WHERE name = $1`, [teamtype]);

    pool.query('INSERT INTO registrationcode (code, used, validuntil, teamtype_fk) VALUES ($1, $2, $3, $4)', [randomNum, 0, epochTomorrow, results.rows[0].id], (err, result) => {
        if (err) {
            console.log(err);
        }
    });
}

async function getRegistrationCodes() {
    //Get Epoch Timestamp from last week
    const now = new Date();
    const epochLastWeek = Math.floor(now.getTime() / 1000) - 7 * 24 * 60 * 60;

    const query = util.promisify(pool.query).bind(pool);
    const results = await query(`SELECT *, teamtype.displayname FROM registrationcode LEFT JOIN teamtype ON registrationcode.teamtype_fk = teamtype.id WHERE validuntil>$1 ORDER BY used, validuntil DESC`,[epochLastWeek]);

    return results.rows.map(result => {
        const {code, validuntil, used, displayname} = result;
        const now = new Date();

        const valid = (new Date(validuntil * 1000) > now) && !used;

        return {
            code,
            used: used ? 'Yes' : 'No',
            validuntil: new Date(validuntil * 1000).toLocaleString('de-CH', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            teamname: displayname,
            valid: valid
        };
    });
}

function updateRegistrationCode(code, used) {
    //Get Epoch Timestamp from tomorrow
    const now = new Date();
    const epochTomorrow = Math.floor(now.getTime() / 1000) + 24 * 60 * 60;

    pool.query('UPDATE registrationcode SET used = $1, validuntil = $3 WHERE code = $2', [used, code, epochTomorrow], (err, result) => {
        if (err) {
            console.log(err);
        }
    });
}
module.exports = router;