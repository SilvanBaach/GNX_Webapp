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
 * POST route for generating a coupon
 */
router.post('/generateCouponCode', checkNotAuthenticated, permissionCheck('home', 'canOpen'), async (req, res) => {
    try {
        const couponCode = generateCouponCode();
        let expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 24);
        const formattedExpiryDate = expirationDate.toISOString().split('T')[0];

        const couponData = {
            code: couponCode,
            discount_type: 'percent',
            amount: `${req.user.team.salepercentage}`,
            individual_use: true,
            date_expires: `${formattedExpiryDate}`,
            apply_before_tax: true,
            exclude_sale_items: true,
            usage_limit: 1,
            excluded_product_categories: [58] //Exclude the "Genetix+" category
        };

        const response = await wooCommerce.post('coupons', couponData);
        insertCouponCode(req.user.id, formattedExpiryDate, couponCode);
        res.json({success: true, couponCode: couponCode});
    } catch (error) {
        console.error('Error generating coupon:', error);
        res.status(500).json({success: false, message: 'Error generating coupon'});
    }
});

/**
 * GET route for getting the current coupon code
 */
router.get('/getLatestCouponCode', checkNotAuthenticated, permissionCheck('home', 'canOpen'), (req, res) => {
    getLatestCouponCode(req.user.id).then((result) => {
        if (result.rows.length === 0) {
            res.status(200).json({success: true, couponCode: '-'});
        } else {
            res.status(200).json({success: true, couponCode: result.rows[0].code});
        }
    }).catch(() => {
        res.status(500).json({success: false, message: 'Error getting coupon code'});
    });
});

/**
 * POST route for linking a shop to an account
 */
router.post('/linkShop', checkNotAuthenticated, permissionCheck('home', 'canOpen'), async (req, res) => {
    try {
        const {username, password} = req.body;

        const tokenResponse = await axios.post('https://store.teamgenetix.ch/oauth/token', {
            username: username,
            password: password,
            client_id: process.env.OAUTH_CLIENT_ID,
            client_secret: process.env.OAUTH_CLIENT_SECRET,
            grant_type: 'password'
        });

        const refreshToken = tokenResponse.data.refresh_token;
        storeWPRefreshToken(refreshToken, req.user.id).then(() => {
            res.status(200).json({success: true, message: 'Successfully linked shop account!'});
        }).catch((e) => {
            console.error('Error linking shop:', e);
            res.status(500).json({success: false, message: 'Error linking shop account!'});
        });
    } catch (error) {
        console.error('Error linking shop:', error);
        res.status(500).send({message: 'Error during authentication! Please check your credentials.'});
    }
});

/**
 * GET route for retrieving subscription data
 */
router.get('/getLatestCouponCode', checkNotAuthenticated, permissionCheck('home', 'canOpen'), async (req, res) => {
    try {
        const result = await getRefreshTokenFromDB(req.user.id);
        console.log(result.rows[0]);
        const refreshToken = result.rows[0].wprefreshtoken;
        if (!refreshToken || refreshToken.length < 5){
            return res.status(401).send({message: 'You have not linked your shop account yet!'});
        }

        const accessToken = await refreshAccessToken(refreshToken);

        if (!accessToken) {
            return res.status(401).send('Unable to refresh access token');
        }

        const productsResponse = await axios.get(`${WC_API_URL}/products?category=58`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        res.json(productsResponse.data);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products from category 58');
    }
});

/**
 * Stores the wp refresh token in the database
 * @param refreshToken
 * @param userId
 * @returns {Promise<QueryResult<any>>}
 */
function storeWPRefreshToken(refreshToken, userId) {
    return pool.query('UPDATE account SET wprefreshtoken = $1 WHERE id = $2', [refreshToken, userId]);
}

/**
 * Generates a unique coupon code
 * @returns {string}
 */
function generateCouponCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * Inserts the coupon code into the database
 * @param userId
 * @param expDate
 * @param code
 * @returns {Promise<QueryResult<any>>}
 */
function insertCouponCode(userId, expDate, code){
    return pool.query('INSERT INTO couponcodes (account_fk, expirydate, code, creationdate) VALUES ($1, $2, $3, NOW())', [userId, expDate, code]);
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

/**
 * Returns the latest valid coupon code
 * @param userId
 * @returns {Promise<QueryResult<any>>}
 */
function getLatestCouponCode(userId){
    return pool.query('SELECT * FROM couponcodes WHERE account_fk = $1 AND expirydate > NOW() ORDER BY creationdate DESC LIMIT 1', [userId]);
}

module.exports = router;