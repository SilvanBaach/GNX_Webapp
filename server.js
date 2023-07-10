const express = require('express');
const app = express();
const passport = require('passport');
const passportConfig = require('./js/serverJS/passportConfig.js');
const DiscordBot = require('discord.js');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cron = require('node-cron');
const {pool} = require('./js/serverJS/database/dbConfig.js');
const flash = require('express-flash');
const loginRouter = require('./routes/loginRouter.js');
const dashboardRouter = require('./routes/dashboardRouter.js');
const presenceRouter = require('./routes/presenceRouter.js');
const teamRouter = require('./routes/teamRouter.js');
const teamTypeRouter = require('./routes/teamTypeRouter.js');
const registrationCodeRouter = require('./routes/registrationCodeRouter.js');
const {router: userRouter} = require('./routes/userRouter.js');
const registerRouter = require('./routes/registerRouter.js');
const resetPasswordRouter = require('./routes/resetPasswordRouter.js');
const fileshareRouter = require('./routes/fileshareRouter.js');
const teammembershipRouter = require('./routes/teammembershipRouter.js');
const discordBotRouter = require('./routes/discordBotRouter.js');
const {checkAuthenticated} = require('./js/serverJS/sessionChecker.js');

/**
 * MIDDLEWARE
 */
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

/**
 * DISCORD BOT
 */
const guildId = "951559378354450483";
const client = new DiscordBot.Client({intents: 3276799});
client.login(process.env.DISCORD_TOKEN);

/**
 * PASSPORT SETUP / SESSION HANDLING
 */
passportConfig.initialize(passport);
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 60 * 1000 } // Session will last 30 Minutes
}));

app.use(flash());
app.use(passport.session());
app.use(passport.initialize());

/**
 * CLEAN UP JOB FOR EXPIRED SESSIONS
 */
cron.schedule('* * 0 * * *', function() {
    pool.query('DELETE FROM "session" WHERE "expire" < NOW()', (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Expired sessions cleaned up');
        }
    });
});

/**
 * ROUTERS
 */
app.use('/login', loginRouter(passport));
app.use('/dashboard', dashboardRouter);
app.use('/presence', presenceRouter);
app.use('/user', userRouter);
app.use('/team', teamRouter);
app.use('/teamtype', teamTypeRouter);
app.use('/registrationcode', registrationCodeRouter);
app.use('/register', registerRouter);
app.use('/resetPassword', resetPasswordRouter);
app.use('/fileshare', fileshareRouter);
app.use('/teammembership', teammembershipRouter);
app.use('/discordbot', discordBotRouter(client, guildId));

/**
 * MAIN ROUTES
 */
app.get('/', checkAuthenticated,(req, res) => {
    res.render('index');
});

app.get('/register', (req, res) => {
    res.render('register');
});

module.exports = app;