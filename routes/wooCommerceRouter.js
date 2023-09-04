/**
 * Router for traffic from the woocommerce shop
 */
const express = require('express');
const router = express.Router();
const discordBot = require('../js/serverJS/discordBot.js')
const {logMessage, LogLevel} = require('../js/serverJS/logger.js');
const staffRoleId = '951561165283160094';

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
    const dateCreated = formatDate(payload.date_created);
    const total = payload.total;
    const billing = payload.billing;

    const message = `
**<@&${staffRoleId}> Order Received! 🎉**
**Order ID:** ${orderId}
**Status:** ${orderStatus}
**Currency:** ${currency}
**Date Created:** ${dateCreated}
**Total:** ${currency} ${total}

Billing Information: 
- **First Name:** ${billing.first_name || "Not provided"}
- **Last Name:** ${billing.last_name || "Not provided"}
- **Email:** ${billing.email || "Not provided"}
- **Phone:** ${billing.phone || "Not provided"}
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

    const orderId = payload.id;
    const orderStatus = payload.status;
    const dateModified = formatDate(payload.date_modified);
    const total = payload.total;
    const billing = payload.billing;

    const message = `
**<@&${staffRoleId}> Order Updated! 🔄**
**Order ID:** ${orderId}
**Status:** ${orderStatus}
**Date Modified:** ${dateModified}
**Total:** ${total}

**Billing Information:**
- **First Name:** ${billing.first_name}
- **Last Name:** ${billing.last_name}
- **Email:** ${billing.email}
- **Phone:** ${billing.phone}
`;

    discordBot.sendMessageToChannel('1147985961955885168', message);
    console.log('Sent Order Updated message to Discord');

    res.sendStatus(200);
});

/**
 * POST route for receiving a new Contact Inquiry
 */
router.post('/newContactInquiry', (req, res) => {
    const payload = req.body;

    const name = payload.fields.name.value;
    const email = payload.fields.email.value;
    const message = payload.fields.message.value;
    const date = payload.meta.date.value;
    const time = payload.meta.time.value;
    const remoteIp = payload.meta.remote_ip.value;

    const discordMessage = `
**<@&${staffRoleId}> New Inquiry 📨**
**Name:** ${name}
**Email:** ${email}
**Message:**
${message}
**Date:** ${date} at ${time}
**Remote IP:** ${remoteIp}
    `;

    discordBot.sendMessageToChannel('1148167251778867201', discordMessage);
    console.log('Sent new Contact Inquiry message to Discord');

    res.sendStatus(200);
});


/**
 * Format a date string to a german date string
 * @param dateString
 * @returns {string}
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('de-DE', options);
}

module.exports = router;