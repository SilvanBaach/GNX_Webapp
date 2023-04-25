const nodemailer = require('nodemailer');
const { promisify } = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const path = require('path');
require('dotenv').config();
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Class for sending emails
 */
class EmailSender {

    /**
     * Constructor
     */
    constructor() {
        this.init();
    }

    /**
     * Initializes the transporter with the credentials from the .env file
     */
    init() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    /**
     * Sends a reset password email
     * @param email the recipient email
     * @param username the username of the recipient
     */
    async sendResetPasswordMail(email, username, token) {
        const htmlPath = path.join(__dirname, 'html', '../../../../html/resetPasswordEmail.html');
        const cssPath1 = path.join(__dirname, 'css', '../../../../css/resetPasswordEmail.css');
        const cssPath2 = path.join(__dirname, 'css', '../../../../css/style.css');
        const navbarPath = path.join(__dirname, 'html', '../../../../html/nav.html');
        const reloadPath = path.join(__dirname, 'res', 'teams', '../../../../../res/teams/reload_white.jpg');
        const logoPath = path.join(__dirname, 'res', 'logo', '../../../../../res/logo/logo_webheader_blue.jpg');
        let [htmlContent, cssContent1, cssContent2, navbarContent, reloadContent, logoContent] = await Promise.all([
            readFile(htmlPath, 'utf8'),
            readFile(cssPath1, 'utf8'),
            readFile(cssPath2, 'utf8'),
            readFile(navbarPath, 'utf8'),
            readFile(reloadPath),
            readFile(logoPath)
        ]);

        let action = '';
        if (!isProduction) {
            action = `http://localhost:3000/resetPassword/resetPassword/${token}`;
        } else {
            //TODO: Change this to the production url
            console.log('Running in production mode');
            action = '';
        }

        htmlContent = htmlContent.replace('[USERNAME]', username);
        htmlContent = htmlContent.replace('[ACTION]', action);

        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'Reset your password',
            html: `<style>${cssContent1}\n${cssContent2}</style>${htmlContent.replace(
                '<div id="nav-placeholder"></div>',
                navbarContent
            ).replace(
                '<img src="/res/teams/checkmark.png" class="success-img" alt="Picture of a checkmark"/>',
                `<img src="cid:checkmark.png" class="success-img" alt="Picture of a checkmark"/>`
            ).replace(
                '<img class="logo" src="../res/logo/logo_webheader_white.png" style="margin-left: 20px" height="60" width="265"/>',
                `<img class="logo" src="cid:logo.png" style="margin-left: 20px" height="60" width="265"/>`
            )}`,
            attachments: [
                {
                    filename: 'checkmark.png',
                    content: reloadContent,
                    cid: 'checkmark.png'
                },
                {
                    filename: 'logo.png',
                    content: logoContent,
                    cid: 'logo.png'
                }
            ]
        };

        this.sendMail(mailOptions);
    }

    /**
     * generic function for sending emails
     * @param mailOptions array with the mail options
     */
    sendMail(mailOptions){
        this.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
}

module.exports = EmailSender;