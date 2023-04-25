const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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
     */
    sendResetPasswordMail(email) {
        const htmlPath = path.join(__dirname,'../../../html/resetPasswordEmail.html');
        const cssPath1 = path.join(__dirname,'../../../css/resetPasswordEmail.css');
        const cssPath2 = path.join(__dirname,'../../../css/style.css');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        const cssContent1 = fs.readFileSync(cssPath1, 'utf8');
        const cssContent2 = fs.readFileSync(cssPath2, 'utf8');

        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'Reset your password',
            html: `<style>${cssContent1}\</style>htmlContent`
        }

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