/**
 * Router for manipulating teams
 */
const express = require('express');
const router = express.Router();
const {pool} = require('../js/serverJS/database/dbConfig.js');
const {checkNotAuthenticated} = require("../js/serverJS/sessionChecker");
const util = require("util");

/**
 * POST route for updating the calendar order
 */
router.post('/updateCalendarOrder', checkNotAuthenticated, async function (req, res) {
    const data = req.body;
    const newOrder = data.newOrder;

    for (let i = 0; i < newOrder.length; i++) {
        const result = await updateOrder(newOrder[i].userId, newOrder[i].teamId, newOrder[i].order)
        if (result !== 0) {
            return res.status(500).send({ message: "There was an error updating the order! Please try again later." });
        }
    }

    res.status(200).send({ message: "Order updated successfully" });
});


/**
 * Updates the calendar order of a user
 * @param userId the id of the user
 * @param teamId the id of the team
 * @param order the new order value
 * @returns {Promise<number>}
 */
async function updateOrder(userId, teamId, order){
    const query = util.promisify(pool.query).bind(pool);

    const results = await query(`UPDATE teammembership SET calendarorder =  $3 WHERE account_fk = $1  AND team_fk = $2`, [userId, teamId, order]);
    if (results.rowCount  === 0){
        return -1
    }

    return 0;
}

module.exports = router;