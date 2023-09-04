/**
 * Router for traffic from the woocommerce shop
 */
const express = require('express');
const router = express.Router();
const discordBot = require('../js/serverJS/discordBot.js')
const {logMessage, LogLevel} = require('../js/serverJS/logger.js');
const crypto = require('crypto');

/**
 * POST route for receiving a new order
 */
router.post('/orderCreated', (req, res) => {
    const payload = req.body;

    if (!payload.id) {
        console.log('Ignoring payload without order id');
        res.sendStatus(200);
        return;
    }

    const orderId = payload.id;
    const orderStatus = payload.status;
    const currency = payload.currency;
    const dateCreated = payload.date_created;
    const total = payload.total;
    const billing = payload.billing;
    const paymentMethod = payload.payment_method_title || "Not specified";

    const message = `
Order Received! 🎉
Order ID: ${orderId}
Status: ${orderStatus}
Currency: ${currency}
Date Created: ${dateCreated}
Total: ${currency} ${total}
Payment Method: ${paymentMethod}
Billing Information: 
    - First Name: ${billing.first_name || "Not provided"}
    - Last Name: ${billing.last_name || "Not provided"}
    - Email: ${billing.email || "Not provided"}
    - Phone: ${billing.phone || "Not provided"}
`;

    discordBot.sendMessageToChannel('1147985961955885168', message);
    console.log('Sent Order Received message to Discord');
    res.sendStatus(200);
});

/**
 * POST route for receiving an update on an order
 */
router.post('/orderUpdated', (req, res) => {
    const payload = req.body;

    discordBot.sendMessageToChannel('1147985961955885168', payload);
    console.log('Sent Order Updated message to Discord');

    res.sendStatus(200);
});

module.exports = router;