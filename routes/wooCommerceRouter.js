/**
 * Router for traffic from the woocommerce shop
 */
const express = require('express');
const router = express.Router();
const discordBot = require('../js/serverJS/discordBot.js')
const {logMessage, LogLevel} = require('../js/serverJS/logger.js');
const crypto = require('crypto');

router.post('/orderCreated', (req, res) => {
    console.log('Received webhook');
    discordBot.sendMessageToUser('admatomschlag', 'Webhook received' )
    const receivedSignature = req.headers['x-wc-webhook-signature'];
    const payload = JSON.stringify(req.body);

    const generatedSignature = crypto
        .createHmac('sha256', 'your-secret-key')
        .update(payload)
        .digest('base64');

    if (receivedSignature === generatedSignature) {
        // Handle the webhook event
        discordBot.sendMessageToUser('admatomschlag', 'New order received! Check the admin panel for more details! Payload: ' + payload )
        console.log('Received valid webhook');
    } else {
        // Log an error or possibly respond with an error status
        discordBot.sendMessageToUser('admatomschlag', 'Received invalid webhook! Payload: ' + payload )
        console.log('Received invalid webhook');
    }
});

module.exports = router;