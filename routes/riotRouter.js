const express = require('express');
const router = express.Router();
const riot = require('../js/serverJS/riot.js')


/**
 * GET DDragon Data from project
 */
router.get('/getDDragonData', async (req, res) => {
    const championData = await riot.getDDragonDataFromProject();
    res.send(championData);
});

module.exports = router;