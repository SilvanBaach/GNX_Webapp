/**
 * Router for traffic from the woocommerce shop
 */
const express = require('express');
const router = express.Router();
const discordBot = require('../js/serverJS/discordBot.js')
const {logMessage, LogLevel} = require('../js/serverJS/logger.js');
const crypto = require('crypto');

router.post('/orderCreated', (req, res) => {
    const receivedSignature = req.headers['x-wc-webhook-signature'];
    const payload = JSON.stringify(req.body);

    const generatedSignature = crypto
        .createHmac('sha256', process.env.WOOCOMMERECE_HASH_SECRET)
        .update(payload)
        .digest('base64');

    if (receivedSignature === generatedSignature) {
        // Handle the webhook event
        discordBot.sendMessageToChannel('1147985961955885168', 'Received valid webhook! Payload: ' + payload )
        console.log('Received valid webhook');
    } else {
        // Log an error or possibly respond with an error status
        discordBot.sendMessageToChannel('1147985961955885168', 'Received invalid webhook! Payload: ' + payload )
        console.log('Received invalid webhook');
    }
});

module.exports = router;