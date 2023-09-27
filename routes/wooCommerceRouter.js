/**
 * Router for traffic from the woocommerce shop
 */
const express = require('express');
const router = express.Router();
const discordBot = require('../js/serverJS/discordBot.js')
const {logMessage, LogLevel} = require('../js/serverJS/logger.js');
const staffRoleId = '951561165283160094';
const axios = require('axios');
const {checkNotAuthenticated, permissionCheck} = require("../js/serverJS/sessionChecker");
const userRouter = require("./userRouter");
const encryptLogic = require("../js/serverJS/encryptLogic");
const WooCommerceAPI = require('woocommerce-api');
const {pool} = require("../js/serverJS/database/dbConfig");

/**
 * WooCommerce API configuration for admin
 */
const wooCommerce = new WooCommerceAPI({
    url: 'https://store.teamgenetix.ch',
    consumerKey: process.env.WOOCOMMERECE_CONSUM_KEY,
    consumerSecret: process.env.WOOCOMMERECE_CONSUM_SECRET,
    wpAPI: true,
    version: 'wc/v3'
});

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
 * POST route for linking the webapp to the woocommerce shop
 */
router.post('/linkShopAccount', checkNotAuthenticated, permissionCheck('settings', 'canOpen'), async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const response = await axios.post('https://store.teamgenetix.ch/oauth/token', {
            grant_type: 'password',
            username,
            password,
            client_id: process.env.OAUTH_CLIENT_ID,
            client_secret: process.env.OAUTH_CLIENT_SECRET,
        }, {
            headers: {
                REFERER: process.env.OAUTH_REFER_URI,
                Authorization: 'Basic ' + Buffer.from(process.env.OAUTH_CLIENT_ID + ':' + process.env.OAUTH_CLIENT_SECRET).toString('base64')
            }
        });

        // Request the user's profile data using the token
        const userProfileResponse = await axios.get('https://store.teamgenetix.ch/wp-json/wp/v2/users/me', {
            headers: {
                Authorization: 'Bearer ' + response.data.access_token
            }
        });

        const wpUserId = userProfileResponse.data.id;
        const token = encryptLogic.encrypt(response.data.access_token);
        const refreshToken = encryptLogic.encrypt(response.data.refresh_token);

        userRouter.updateUser({wpuserid: wpUserId, wptoken: token, wprefreshtoken: refreshToken}, req.user.id).then(() => {
            logMessage(`User ${req.user.username} has successfully linked with GNX Clothing!`, LogLevel.INFO, req.user.id,)
            res.status(200).json({ message: "Successfully linked with GNX Clothing!"});
        }).catch(() => {
            console.error("Error updating user with woocommerce data!");
            res.status(400).json({ message: "Error updating user with woocommerce data!"});
        });

    } catch (error) {
        console.error("Error getting OAuth token!" + error);
        res.status(400).json({ message: "Error authenticating with the shop. " + error.response.data.error_description});
    }
});

/**
 * GET route for retrieving a coupon code for the user
 */
router.get('/getCouponCode', checkNotAuthenticated, permissionCheck('settings', 'canOpen'), async (req, res) => {
    try {
        let accessToken = encryptLogic.decrypt(req.user.wptoken);
        const refreshToken = encryptLogic.decrypt(req.user.wprefreshtoken);
        const wpUserId = req.user.wpuserid;

        if (!await testAccessToken(accessToken)) {
            accessToken = await refreshAccessToken(refreshToken, req.user.id);
            if (!accessToken) {
                res.status(401).json({ error: 'Failed to refresh token' });
                return;
            }
        }

        const userEmail = await getUserEmailByWpId(wpUserId, accessToken);

        if (!userEmail) {
            res.status(400).json({ error: 'User email not found' });
            return;
        }

        const couponData = {
            code: generateCouponCode(),
            discount_type: 'percent',
            amount: `${req.user.team.salepercentage}`,
            individual_use: true,
            email_restrictions: [userEmail]
        };

        const response = await wooCommerce.postAsync('coupons', couponData);
        if (response.statusCode === 201) {
            res.json(JSON.parse(response.body));
        } else {
            res.status(response.statusCode).json(JSON.parse(response.body));
        }
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

/**
 * Generates a new coupon code string
 * @returns {string}
 */
function generateCouponCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'GNX-';
    for (let i = 0; i < 7; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

/**
 * Returns the email of a given user by wp id
 * @param wpUserId
 * @param accessToken
 * @returns {Promise<*|null>}
 */
async function getUserEmailByWpId(wpUserId, accessToken) {
    try {
        const response = await axios.get(`https://store.teamgenetix.ch/wp-json/wp/v2/users/${wpUserId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.data && response.data.email) {
            return response.data.email;
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Failed to get user email: ${error}`);
        return null;
    }
}

/**
 * Refreshes the access token using the refresh token
 * @param refreshToken
 * @param userId
 * @returns {Promise<*|null>}
 */
async function refreshAccessToken(refreshToken, userId) {
    try {
        const response = await axios.post('https://store.teamgenetix.ch/oauth/token', {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: process.env.OAUTH_CLIENT_ID,
            client_secret: process.env.OAUTH_CLIENT_SECRET
        });

        pool.query(`UPDATE account SET wptoken = $1, wprefreshtoken = $2 WHERE id = $3`, [response.data.access_token, response.data.refresh_token, userId], (err) => {
            return response.data.access_token;
        });
    } catch (error) {
        console.error(`Failed to refresh token: ${error}`);
        return null;
    }
}

/**
 * Tests if the access token is still valid
 * @param accessToken
 * @returns {Promise<boolean>}
 */
async function testAccessToken(accessToken) {
    try {
        const response = await axios.get('https://store.teamgenetix.ch/wp-json/wp/v2/users/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

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